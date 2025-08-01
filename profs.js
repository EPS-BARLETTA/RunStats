// profs.js

const startScanBtn = document.getElementById('startScanBtn');
const videoElem = document.getElementById('video');
const elevesTableBody = document.querySelector('#elevesTable tbody');
const triSelect = document.getElementById('triSelect');
const creerGroupesBtn = document.getElementById('creerGroupesBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const rechercheInput = document.getElementById('rechercheInput');
const groupesSection = document.getElementById('groupesSection');
const groupesTableBody = document.querySelector('#groupesTable tbody');
const exportGroupesCSVBtn = document.getElementById('exportGroupesCSVBtn');

let eleves = [];
let groupes = [];

// Fonction pour ajouter les élèves récupérés dans le tableau principal (sans doublon)
function ajouterEleves(nouveauxEleves) {
  nouveauxEleves.forEach((el) => {
    // Vérifie si déjà présent (même nom+prenom+classe)
    if (!eleves.some(e => e.nom === el.nom && e.prenom === el.prenom && e.classe === el.classe)) {
      eleves.push(el);
    }
  });
  afficherEleves();
}

// Affiche la liste filtrée/triee dans le tableau
function afficherEleves() {
  const filtre = rechercheInput.value.toLowerCase();
  const tri = triSelect.value;

  let liste = eleves.filter(e => {
    return (
      e.nom.toLowerCase().includes(filtre) ||
      e.prenom.toLowerCase().includes(filtre) ||
      e.classe.toLowerCase().includes(filtre) ||
      e.sexe.toLowerCase().includes(filtre)
    );
  });

  // Tri
  if (tri === 'alphabetique') {
    liste.sort((a,b) => a.nom.localeCompare(b.nom));
  } else if (tri === 'vma') {
    liste.sort((a,b) => (b.vma || 0) - (a.vma || 0));
  } else if (tri === 'sexe') {
    liste.sort((a,b) => a.sexe.localeCompare(b.sexe));
  } else if (tri === 'distance') {
    liste.sort((a,b) => (b.distance || 0) - (a.distance || 0));
  } else if (tri === 'classe') {
    liste.sort((a,b) => a.classe.localeCompare(b.classe));
  }

  elevesTableBody.innerHTML = '';
  liste.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.nom}</td>
      <td>${e.prenom}</td>
      <td>${e.classe}</td>
      <td>${e.sexe}</td>
      <td>${e.vma !== null && e.vma !== undefined ? e.vma : ''}</td>
      <td>${e.distance !== null && e.distance !== undefined ? e.distance : ''}</td>
    `;
    elevesTableBody.appendChild(tr);
  });
}

// Fonction création groupes mixtes par VMA
function creerGroupes() {
  groupesSection.style.display = 'block';
  groupesTableBody.innerHTML = '';
  groupes = [];

  // Trier les élèves par VMA descendante
  let elevesAvecVma = eleves.filter(e => e.vma !== null && e.vma !== undefined).sort((a,b) => b.vma - a.vma);
  let elevesSansVma = eleves.filter(e => e.vma === null || e.vma === undefined);

  // On va faire des groupes de 4 : 1 haute, 2 moyennes, 1 basse
  // Définir haute / moyenne / basse selon tiers

  const n = elevesAvecVma.length;
  if (n < 4) {
    alert('Pas assez d\'élèves avec VMA pour créer des groupes');
    return;
  }

  // Définition des seuils pour haute/moyenne/basse
  const seuilHaute = elevesAvecVma[Math.floor(n / 3)].vma;
  const seuilBasse = elevesAvecVma[Math.floor(2 * n / 3)].vma;

  const haute = elevesAvecVma.filter(e => e.vma >= seuilHaute);
  const moyenne = elevesAvecVma.filter(e => e.vma < seuilHaute && e.vma >= seuilBasse);
  const basse = elevesAvecVma.filter(e => e.vma < seuilBasse);

  let groupesTemp = [];
  let i = 0;

  while (true) {
    if (haute.length === 0 || moyenne.length < 2 || basse.length === 0) break;

    // Créer un groupe
    let groupe = [];

    // 1 VMA haute
    groupe.push(haute.shift());

    // 2 VMA moyennes
    groupe.push(moyenne.shift());
    groupe.push(moyenne.shift());

    // 1 VMA basse
    groupe.push(basse.shift());

    groupesTemp.push(groupe);
    i++;
  }

  // Répartir les élèves sans VMA dans les groupes restants
  let resteEleves = haute.concat(moyenne, basse, elevesSansVma);

  for (let j = 0; j < resteEleves.length; j++) {
    let idx = j % groupesTemp.length;
    groupesTemp[idx].push(resteEleves[j]);
  }

  // Affecter numéro de groupe
  groupesTemp.forEach((groupe, index) => {
    groupe.forEach(el => {
      groupes.push({ groupe: index + 1, ...el });
    });
  });

  afficherGroupes();
}

function afficherGroupes() {
  groupesTableBody.innerHTML = '';
  groupes.forEach(el => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${el.groupe}</td>
      <td>${el.nom}</td>
      <td>${el.prenom}</td>
      <td>${el.classe}</td>
      <td>${el.sexe}</td>
      <td>${el.vma !== null && el.vma !== undefined ? el.vma : ''}</td>
      <td>${el.distance !== null && el.distance !== undefined ? el.distance : ''}</td>
    `;
    groupesTableBody.appendChild(tr);
  });
}

// Export CSV générique
function exportTableToCSV(filename, dataArray, columns) {
  let csv = columns.join(',') + '\n';

  dataArray.forEach(row => {
    let rowCsv = columns.map(col => {
      let val = row[col.toLowerCase()];
      if (val === null || val === undefined) return '';
      return `"${val.toString().replace(/"/g, '""')}"`;
    }).join(',');
    csv += rowCsv + '\n';
  });

  const blob = new Blob([csv], {type: 'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

exportCSVBtn.addEventListener('click', () => {
  exportTableToCSV('eleves.csv', eleves, ['Nom', 'Prénom', 'Classe', 'Sexe', 'VMA', 'Distance']);
});

exportGroupesCSVBtn.addEventListener('click', () => {
  exportTableToCSV('groupes.csv', groupes, ['Groupe', 'Nom', 'Prénom', 'Classe', 'Sexe', 'VMA', 'Distance']);
});

creerGroupesBtn.addEventListener('click', creerGroupes);
triSelect.addEventListener('change', afficherEleves);
rechercheInput.addEventListener('input', afficherEleves);

// Scanner QR Code avec html5-qrcode
let html5QrCode;
let scanning = false;

startScanBtn.addEventListener('click', () => {
  if (scanning) {
    stopScanning();
    startScanBtn.textContent = 'Scanner un QR Code';
  } else {
    startScanning();
    startScanBtn.textContent = 'Arrêter le scan';
  }
});

function startScanning() {
  videoElem.style.display = 'block';
  html5QrCode = new Html5Qrcode("video");

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      let cameraId = devices[0].id;
      html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          try {
            const data = JSON.parse(qrCodeMessage);
            if (data.eleve1 && data.eleve2) {
              ajouterEleves([data.eleve1, data.eleve2]);
              alert('Infos du groupe ajoutées');
            } else {
              alert('QR code invalide');
            }
          } catch (err) {
            alert('Erreur lecture QR code');
          }
        },
        errorMessage => {
          // console.log('Scan error:', errorMessage);
        }
      );
      scanning = true;
    }
  }).catch(err => {
    alert('Erreur accès caméra : ' + err);
  });
}

function stopScanning() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      videoElem.style.display = 'none';
      scanning = false;
    }).catch(err => {
      console.error('Erreur arrêt scan:', err);
    });
  }
}
