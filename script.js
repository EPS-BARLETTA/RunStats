// ==== Variables globales ====
const eleves = []; // stockage élèves scannés
let groupes = [];

const eleveForm = document.getElementById('eleve-form');
const qrContainer = document.getElementById('qr-container');
const qrCodeCanvas = document.getElementById('qr-code');
const switchProfBtn = document.getElementById('switch-prof');
const switchEleveBtn = document.getElementById('switch-eleve');

const profContainer = document.getElementById('prof-container');
const eleveContainer = document.getElementById('eleve-container');

const scanBtn = document.getElementById('start-scan');
const videoPreview = document.getElementById('video-preview');

const elevesTableBody = document.querySelector('#eleves-table tbody');
const groupesContainer = document.getElementById('groupes-container');

const sortSelect = document.getElementById('sort-select');
const filterInput = document.getElementById('filter-input');
const exportCsvBtn = document.getElementById('export-csv');
const createGroupsBtn = document.getElementById('create-groups');


// ==== Fonction générer QR Code côté élève ====

function generateQRCode(data) {
    qrContainer.innerHTML = '';
    // Utilisation de QRCode.js (lib à inclure dans HTML)
    new QRCode(qrContainer, {
        text: JSON.stringify(data),
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ==== Soumission du formulaire élève ====

eleveForm.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
        nom: eleveForm.nom.value.trim(),
        prenom: eleveForm.prenom.value.trim(),
        classe: eleveForm.classe.value,
        sexe: eleveForm.sexe.value,
        vma: parseFloat(eleveForm.vma.value),
        distance: parseFloat(eleveForm.distance.value)
    };

    if (!data.nom || !data.prenom || !data.classe || !data.sexe || isNaN(data.vma) || isNaN(data.distance)) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    generateQRCode(data);
});


// ==== Switch entre interface élève et prof ====

switchProfBtn.addEventListener('click', () => {
    eleveContainer.classList.remove('active');
    profContainer.classList.add('active');
    stopVideoStream();
});

switchEleveBtn.addEventListener('click', () => {
    profContainer.classList.remove('active');
    eleveContainer.classList.add('active');
    stopVideoStream();
});

// ==== Scanner QR Code côté prof ====

let videoStream;
const canvasElement = document.createElement('canvas');
const canvasContext = canvasElement.getContext('2d');

scanBtn.addEventListener('click', async () => {
    // demande caméra
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoPreview.srcObject = videoStream;
        videoPreview.play();
        scanBtn.disabled = true;
        scanQRCodeLoop();
    } catch (error) {
        alert('Impossible d\'accéder à la caméra: ' + error);
    }
});

function stopVideoStream() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        scanBtn.disabled = false;
        videoPreview.srcObject = null;
    }
}

function scanQRCodeLoop() {
    if (!videoStream) return;

    canvasElement.width = videoPreview.videoWidth;
    canvasElement.height = videoPreview.videoHeight;
    canvasContext.drawImage(videoPreview, 0, 0, canvasElement.width, canvasElement.height);

    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
        try {
            const eleveData = JSON.parse(code.data);
            if (eleveData.nom && eleveData.prenom) {
                addEleve(eleveData);
                alert(`Élève ajouté: ${eleveData.prenom} ${eleveData.nom}`);
                stopVideoStream();
                return; // Stop scan après détection
            }
        } catch {
            // QR code non valide pour élève, on continue
        }
    }
    requestAnimationFrame(scanQRCodeLoop);
}

// ==== Ajouter élève dans tableau et tableau principal ====

function addEleve(eleve) {
    // Eviter doublons sur nom+prenom+classe
    const exists = eleves.some(e => e.nom === eleve.nom && e.prenom === eleve.prenom && e.classe === eleve.classe);
    if (!exists) {
        eleves.push(eleve);
        refreshTable();
    } else {
        alert('Cet élève est déjà enregistré.');
    }
}

// ==== Afficher tableau principal ====

function refreshTable() {
    // Appliquer filtre et tri
    let filtered = eleves.filter(e => e.classe.toLowerCase().includes(filterInput.value.toLowerCase()));

    // Tri
    const sortBy = sortSelect.value;
    filtered.sort((a,b) => {
        if (sortBy === 'nom') {
            return a.nom.localeCompare(b.nom);
        } else if (sortBy === 'vma') {
            return b.vma - a.vma;
        } else if (sortBy === 'sexe') {
            return a.sexe.localeCompare(b.sexe);
        } else if (sortBy === 'distance') {
            return b.distance - a.distance;
        } else if (sortBy === 'classe') {
            return a.classe.localeCompare(b.classe);
        }
        return 0;
    });

    elevesTableBody.innerHTML = '';
    for (const e of filtered) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.nom}</td>
            <td>${e.prenom}</td>
            <td>${e.classe}</td>
            <td>${e.sexe}</td>
            <td>${e.vma.toFixed(2)}</td>
            <td>${e.distance.toFixed(2)}</td>
        `;
        elevesTableBody.appendChild(tr);
    }
}

// ==== Recherche temps réel ====

filterInput.addEventListener('input', refreshTable);

// ==== Export CSV ====

exportCsvBtn.addEventListener('click', () => {
    let csv = 'Nom,Prénom,Classe,Sexe,VMA,Distance\n';
    eleves.forEach(e => {
        csv += `${e.nom},${e.prenom},${e.classe},${e.sexe},${e.vma},${e.distance}\n`;
    });
    downloadCSV(csv, 'eleves.csv');
});

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==== Création groupes mixtes VMA haute/moyenne/basse ====

createGroupsBtn.addEventListener('click', () => {
    if (eleves.length < 4) {
        alert("Il faut au moins 4 élèves pour créer des groupes.");
        return;
    }

    groupes = creerGroupes(eleves);
    afficherGroupes(groupes);
});

// Fonction créer groupes
function creerGroupes(listeEleves) {
    // Trier par VMA décroissante
    const sorted = [...listeEleves].sort((a,b) => b.vma - a.vma);

    // Séparer par sexe pour forcer mixité
    const filles = sorted.filter(e => e.sexe.toLowerCase() === 'f');
    const garcons = sorted.filter(e => e.sexe.toLowerCase() === 'm');

    const groupes = [];
    let indexF = 0, indexG = 0;

    // On va créer les groupes un par un en forçant mixité (au moins 1 fille et 1 garçon par groupe si possible)
    while ((indexF < filles.length || indexG < garcons.length) && (groupes.length * 4 < sorted.length)) {
        const groupe = [];

        // 1 VMA haute (priorité fille, sinon garçon)
        if (indexF < filles.length) {
            groupe.push(filles[indexF++]);
        } else if (indexG < garcons.length) {
            groupe.push(garcons[indexG++]);
        }

        // 2 VMA moyennes (on va chercher dans les deux listes au milieu)
        // Ici simplifié, on prend au hasard 2 du reste trié par VMA
        // Pour garder la répartition on va prendre 2 du milieu

        // On crée une liste des élèves restant (sans ceux du groupe)
        const restants = sorted.filter(e => !groupes.flat().includes(e) && !groupe.includes(e));

        // On cherche 2 élèves avec VMA moyenne (au milieu)
        const vmaMax = Math.max(...restants.map(e => e.vma));
        const vmaMin = Math.min(...restants.map(e => e.vma));
        const vmaMilieu = (vmaMax + vmaMin) / 2;

        // Trier restants par écart à vmaMilieu
        restants.sort((a,b) => Math.abs(a.vma - vmaMilieu) - Math.abs(b.vma - vmaMilieu));

        // Ajouter 2 élèves du milieu (en essayant la mixité)
        for (let i=0; i<restants.length && groupe.length < 3; i++) {
            const e = restants[i];
            // On évite 2 fois même sexe consécutif
            if (groupe.filter(x => x.sexe === e.sexe).length < 2) {
                groupe.push(e);
            }
        }

        // Si pas assez, compléter avec restants
        while (groupe.length < 3 && restants.length > 0) {
            groupe.push(restants.shift());
        }

        // 1 VMA basse
        // Trouver élève avec VMA la plus basse restant
        const restantBas = sorted.filter(e => !groupes.flat().includes(e) && !groupe.includes(e));
        if (restantBas.length > 0) {
            const vmaMinRestant = Math.min(...restantBas.map(e => e.vma));
            const eleveBas = restantBas.find(e => e.vma === vmaMinRestant);
            groupe.push(eleveBas);
        }

        groupes.push(groupe);
    }

    return groupes;
}

// Affichage des groupes avec couleurs distinctes
function afficherGroupes(groupes) {
    groupesContainer.innerHTML = '<h2>Groupes Créés</h2>';

    const colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#8bc34a'];

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Groupe</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Classe</th>
            <th>Sexe</th>
            <th>VMA</th>
            <th>Distance</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    groupes.forEach((groupe, i) => {
        const color = colors[i % colors.length];
        groupe.forEach(eleve => {
            const tr = document.createElement('tr');
            tr.style.backgroundColor = color + '33'; // couleur semi-transparente
            tr.innerHTML = `
                <td>${i+1}</td>
                <td>${eleve.nom}</td>
                <td>${eleve.prenom}</td>
                <td>${eleve.classe}</td>
                <td>${eleve.sexe}</td>
                <td>${eleve.vma.toFixed(2)}</td>
                <td>${eleve.distance.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    });

    table.appendChild(tbody);
    groupesContainer.appendChild(table);

    // Ajouter bouton téléchargement CSV groupes
    let exportBtn = document.getElementById('export-groupes-csv');
    if (!exportBtn) {
        exportBtn = document.createElement('button');
        exportBtn.id = 'export-groupes-csv';
        exportBtn.textContent = 'Télécharger groupes CSV';
        exportBtn.style.marginTop = '10px';
        groupesContainer.appendChild(exportBtn);

        exportBtn.addEventListener('click', () => {
            let csv = 'Groupe,Nom,Prénom,Classe,Sexe,VMA,Distance\n';
            groupes.forEach((groupe, i) => {
                groupe.forEach(e => {
                    csv += `${i+1},${e.nom},${e.prenom},${e.classe},${e.sexe},${e.vma},${e.distance}\n`;
                });
            });
            downloadCSV(csv, 'groupes.csv');
        });
    }
}
