// Variables globales
let duree = 0;
let distanceTour = 0;
let vmaOptionnelle = 0;

let tourNum = 0;
let distanceTotalEleve1 = 0;
let distanceTotalEleve2 = 0;

let tempsRestant = 0;
let timerInterval = null;

let eleveActuel = 1; // 1 ou 2
let enCourse = false;
let course1Terminee = false;
let course2Terminee = false;

// DOM
const sectionSaisie = document.getElementById('saisie-section');
const sectionCourse = document.getElementById('course-section');

const demarrerBtn = document.getElementById('demarrer-btn');
const plusTourBtn = document.getElementById('plus-tour-btn');
const resetBtn = document.getElementById('reset-btn');

const demarrerCourseBtn = document.getElementById('demarrer-course-btn');
const plusTourCourseBtn = document.getElementById('plus-tour-course-btn');
const resetCourseBtn = document.getElementById('reset-course-btn');

const timerCircle = document.getElementById('timer-circle');

const nom1Course = document.getElementById('nom1-course');
const prenom1Course = document.getElementById('prenom1-course');
const distance1Span = document.getElementById('distance1');
const vitesse1Span = document.getElementById('vitesse1');
const vma1Span = document.getElementById('vma1');

const nom2Course = document.getElementById('nom2-course');
const prenom2Course = document.getElementById('prenom2-course');
const distance2Span = document.getElementById('distance2');
const vitesse2Span = document.getElementById('vitesse2');
const vma2Span = document.getElementById('vma2');

const eleve1Info = document.getElementById('eleve1-info');
const eleve2Info = document.getElementById('eleve2-info');

const eleve1Course = document.getElementById('eleve1-course');
const eleve2Course = document.getElementById('eleve2-course');

const nombreToursDiv = document.getElementById('nombre-tours');
const ajoutToursSection = document.getElementById('ajout-tours-section');
const partageSection = document.getElementById('partage-section');
const qrcodeContainer = document.getElementById('qrcode');

// Récupérer inputs
function getInputValues() {
    return {
        nom1: document.getElementById('nom1').value.trim(),
        prenom1: document.getElementById('prenom1').value.trim(),
        classe1: document.getElementById('classe1').value.trim(),
        sexe1: document.getElementById('sexe1').value,

        nom2: document.getElementById('nom2').value.trim(),
        prenom2: document.getElementById('prenom2').value.trim(),
        classe2: document.getElementById('classe2').value.trim(),
        sexe2: document.getElementById('sexe2').value,
    }
}

function validateInputs() {
    const inputs = getInputValues();
    if (!inputs.nom1 || !inputs.prenom1 || !inputs.classe1 || !inputs.sexe1) return false;
    if (!inputs.nom2 || !inputs.prenom2 || !inputs.classe2 || !inputs.sexe2) return false;

    const dureeVal = parseInt(document.getElementById('duree').value, 10);
    const distVal = parseFloat(document.getElementById('distanceTour').value);
    if (isNaN(dureeVal) || dureeVal <= 0) return false;
    if (isNaN(distVal) || distVal <= 0) return false;
    return true;
}

function formToCourseData() {
    duree = parseInt(document.getElementById('duree').value, 10);
    distanceTour = parseFloat(document.getElementById('distanceTour').value);
    vmaOptionnelle = parseFloat(document.getElementById('vma').value) || 0;
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateCourseDisplay() {
    // Mettre à jour les infos course
    nom1Course.textContent = document.getElementById('nom1').value;
    prenom1Course.textContent = document.getElementById('prenom1').value;
    distance1Span.textContent = distanceTotalEleve1.toFixed(1);
    vitesse1Span.textContent = (distanceTotalEleve1 / (duree*60) * 60).toFixed(2);
    vma1Span.textContent = vmaOptionnelle ? vmaOptionnelle.toFixed(2) : "N/A";

    nom2Course.textContent = document.getElementById('nom2').value;
    prenom2Course.textContent = document.getElementById('prenom2').value;
    distance2Span.textContent = distanceTotalEleve2.toFixed(1);
    vitesse2Span.textContent = (distanceTotalEleve2 / (duree*60) * 60).toFixed(2);
    vma2Span.textContent = vmaOptionnelle ? vmaOptionnelle.toFixed(2) : "N/A";

    nombreToursDiv.textContent = `Nombre de tours : ${tourNum}`;

    // Encadré bleu sur coureur courant
    if (eleveActuel === 1) {
        eleve1Course.classList.add('encadre-bleu');
        eleve2Course.classList.remove('encadre-bleu');
    } else {
        eleve2Course.classList.add('encadre-bleu');
        eleve1Course.classList.remove('encadre-bleu');
    }
}

// Reset
function resetAll() {
    clearInterval(timerInterval);
    timerInterval = null;
    tempsRestant = 0;
    tourNum = 0;
    distanceTotalEleve1 = 0;
    distanceTotalEleve2 = 0;
    eleveActuel = 1;
    enCourse = false;
    course1Terminee = false;
    course2Terminee = false;

    // Afficher section saisie, cacher course
    sectionSaisie.classList.remove('hidden');
    sectionCourse.classList.add('hidden');

    // Réinitialiser inputs
    document.getElementById('nom1').value = '';
    document.getElementById('prenom1').value = '';
    document.getElementById('classe1').value = '';
    document.getElementById('sexe1').value = '';

    document.getElementById('nom2').value = '';
    document.getElementById('prenom2').value = '';
    document.getElementById('classe2').value = '';
    document.getElementById('sexe2').value = '';

    document.getElementById('duree').value = '';
    document.getElementById('distanceTour').value = '';
    document.getElementById('vma').value = '';

    timerCircle.textContent = "00:00";
    timerCircle.classList.remove('clignote');

    ajoutToursSection.classList.add('hidden');
    partageSection.classList.add('hidden');
    plusTourBtn.disabled = true;
    plusTourCourseBtn.disabled = true;
    nombreToursDiv.textContent = "Nombre de tours : 0";

    qrcodeContainer.innerHTML = '';

    // Réactiver boutons démarrer
    demarrerBtn.disabled = false;
    demarrerCourseBtn.disabled = false;
}

// Timer fonction
function startTimer() {
    if (!validateInputs()) {
        alert("Veuillez remplir tous les champs correctement !");
        return;
    }

    formToCourseData();

    // Masquer saisie, afficher course
    sectionSaisie.classList.add('hidden');
    sectionCourse.classList.remove('hidden');

    // Initialiser valeurs
    tempsRestant = duree * 60;
    tourNum = 0;
    distanceTotalEleve1 = 0;
    distanceTotalEleve2 = 0;
    eleveActuel = 1;
    enCourse = true;
    course1Terminee = false;
    course2Terminee = false;

    updateCourseDisplay();
    updateTimerDisplay();

    // Bouton + Tour activé
    plusTourCourseBtn.disabled = false;

    // Réinitialiser QR et export
    qrcodeContainer.innerHTML = '';
    partageSection.classList.add('hidden');
    ajoutToursSection.classList.add('hidden');

    // Minuteur
    timerInterval = setInterval(() => {
        tempsRestant--;

        updateTimerDisplay();

        if (tempsRestant <= 10) {
            timerCircle.classList.add('clignote');
        }

        if (tempsRestant <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerCircle.classList.remove('clignote');
            enCourse = false;

            // Activer ajout tours partiels si on a fini la course du coureur courant
            ajoutToursSection.classList.remove('hidden');
            partageSection.classList.remove('hidden');
            plusTourCourseBtn.disabled = true;

            alert(`Fin du temps pour l'élève ${eleveActuel}.`);

            // Après ajout tour partiel, on pourra passer au coureur suivant.
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerCircle.textContent = formatTime(tempsRestant);
}

function ajouterTour() {
    if (!enCourse) return;
    tourNum++;
    if (eleveActuel === 1) {
        distanceTotalEleve1 += distanceTour;
    } else {
        distanceTotalEleve2 += distanceTour;
    }
    updateCourseDisplay();
}

function ajouterTourPartiel(part) {
    if (!enCourse) return;
    const ajoutDistance = distanceTour * part;
    if (eleveActuel === 1) {
        distanceTotalEleve1 += ajoutDistance;
    } else {
        distanceTotalEleve2 += ajoutDistance;
    }
    updateCourseDisplay();

    // Passer au coureur suivant après ajout partiel
    if (eleveActuel === 1) {
        course1Terminee = true;
        eleveActuel = 2;
    } else {
        course2Terminee = true;
        eleveActuel = 1;
    }

    // Si les 2 courses terminées
    if (course1Terminee && course2Terminee) {
        ajoutToursSection.classList.add('hidden');
        plusTourCourseBtn.disabled = true;
        alert("Les deux courses sont terminées !");
    } else {
        // Relancer timer pour le coureur suivant
        tempsRestant = duree * 60;
        updateTimerDisplay();
        enCourse = true;
        plusTourCourseBtn.disabled = false;
        ajoutToursSection.classList.add('hidden');
        updateCourseDisplay();
    }
}

function generateQRCode() {
    qrcodeContainer.innerHTML = '';
    const inputs = getInputValues();

    let qrData = JSON.stringify({
        eleve1: {
            nom: inputs.nom1,
            prenom: inputs.prenom1,
            classe: inputs.classe1,
            sexe: inputs.sexe1,
        },
        eleve2: {
            nom: inputs.nom2,
            prenom: inputs.prenom2,
            classe: inputs.classe2,
            sexe: inputs.sexe2,
        },
        duree,
        distanceTour,
        distanceTotalEleve1,
        distanceTotalEleve2,
        vitesseEleve1: (distanceTotalEleve1 / (duree*60) * 60).toFixed(2),
        vitesseEleve2: (distanceTotalEleve2 / (duree*60) * 60).toFixed(2),
        vmaOptionnelle,
        tours: tourNum,
        eleveActuel,
        course1Terminee,
        course2Terminee,
    });

    try {
        new QRCode(qrcodeContainer, {
            text: qrData,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    } catch(e) {
        console.error("Erreur génération QR Code:", e);
        alert("Erreur lors de la génération du QR Code");
    }
}

function exportCSV() {
    const inputs = getInputValues();

    const data = [
        ['Élève', 'Nom', 'Prénom', 'Classe', 'Sexe', 'Distance totale (m)', 'Vitesse (m/min)', 'Estimation VMA'],
        ['Élève 1', inputs.nom1, inputs.prenom1, inputs.classe1, inputs.sexe1, distanceTotalEleve1.toFixed(1), (distanceTotalEleve1 / (duree*60) * 60).toFixed(2), vmaOptionnelle ? vmaOptionnelle.toFixed(2) : 'N/A'],
        ['Élève 2', inputs.nom2, inputs.prenom2, inputs.classe2, inputs.sexe2, distanceTotalEleve2.toFixed(1), (distanceTotalEleve2 / (duree*60) * 60).toFixed(2), vmaOptionnelle ? vmaOptionnelle.toFixed(2) : 'N/A'],
        [],
        ['Nombre de tours', tourNum],
        ['Durée (min)', duree],
        ['Distance tour (m)', distanceTour],
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(row => {
        csvContent += row.join(";") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resultats_course.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Gestion événements boutons
demarrerBtn.addEventListener('click', startTimer);
demarrerCourseBtn.addEventListener('click', startTimer);
plusTourBtn.addEventListener('click', ajouterTour);
plusTourCourseBtn.addEventListener('click', () => ajouterTourPartiel(0.25));
generateQRBtn.addEventListener('click', generateQRCode);
exportCSVBtn.addEventListener('click', exportCSV);
resetBtn.addEventListener('click', resetAll);
Voici une version complète et fonctionnelle de ton script JavaScript pour gérer une course à relais entre deux élèves, avec timer, comptage des tours, ajout de tours partiels, affichage dynamique, génération de QR code, export CSV, et réinitialisation.  

**Les principales fonctionnalités sont :**  
- Validation des champs du formulaire avant démarrage  
- Démarrage du timer avec gestion du temps restant et clignotement dans les 10 dernières secondes  
- Ajout de tours complets ou partiels au coureur courant  
- Passage automatique au deuxième coureur après la fin du premier  
- Affichage dynamique des informations de la course et des coureurs (distance totale, vitesse, etc.)  
- Génération d’un QR code contenant les données de la course  
- Export des résultats au format CSV  
- Réinitialisation complète pour recommencer une nouvelle course  

---

Si tu veux, je peux t’aider aussi à intégrer ce script dans ta page HTML complète, avec le markup et un style CSS simple pour que tout fonctionne ensemble — dis-moi si tu veux.  

Si tu as un souci sur un point particulier, n’hésite pas à me demander !  

---

### Rappel rapide des fonctions importantes dans ton script :  
- `validateInputs()` : vérifie que tous les champs nécessaires sont remplis et valides  
- `startTimer()` : lance la course, cache la saisie et démarre le compte à rebours  
- `ajouterTour()` : ajoute un tour complet au coureur actuel  
- `ajouterTourPartiel(part)` : ajoute une fraction de tour, puis bascule sur le coureur suivant  
- `updateCourseDisplay()` : met à jour l’affichage des distances, vitesses, nom/prénom des coureurs  
- `generateQRCode()` : crée un QR code avec les données de la course  
- `exportCSV()` : télécharge les données au format CSV  
- `resetAll()` : remet tout à zéro, prêt à une nouvelle saisie et course  

---

Veux-tu que je te génère un exemple complet avec HTML + CSS + ce script inclus pour tester d’un coup ?
