// élève.js
const demarrerBtn = document.getElementById('demarrerBtn');
const plusTourBtn = document.getElementById('plusTourBtn');
const resetBtn = document.getElementById('resetBtn');

const demarrerCourseBtn = document.getElementById('demarrerCourseBtn');
const plusTourCourseBtn = document.getElementById('plusTourCourseBtn');
const resetCourseBtn = document.getElementById('resetCourseBtn');

const saisieSection = document.getElementById('saisie-section');
const courseSection = document.getElementById('course-section');
const finSection = document.getElementById('fin-section');

const timerDisplay = document.getElementById('timer-display');
const timerCircle = document.getElementById('timer-circle');
const ajoutTempsSection = document.getElementById('ajout-temps');

const eleveCourantP = document.getElementById('eleve-courant');
const distanceRealiseP = document.getElementById('distance-realise');
const vitesseP = document.getElementById('vitesse');
const vmaEstimeeP = document.getElementById('vma-estimee');
const numTourP = document.getElementById('num-tour');

const exportCsvBtn = document.getElementById('exportCsvBtn');
const qrCodeBtn = document.getElementById('qrCodeBtn');
const qrcodeContainer = document.getElementById('qrcode');

// Variables globales
let duree = 0;
let distanceTour = 0;
let vmaConnu = 0;

let timer = null;
let tempsRestant = 0;

let tourNum = 0;
let distanceTotal = 0;

let courseEnCours = 0; // 1 ou 2
let eleveActuel = 1;

let courses = [
    { eleve1: {}, eleve2: {}, distance: 0, tours: 0, vitesse: 0, vmaEstimee: 0 },
    { eleve1: {}, eleve2: {}, distance: 0, tours: 0, vitesse: 0, vmaEstimee: 0 }
];

function getInputValues() {
    return {
        nom1: document.getElementById('nom1').value.trim(),
        prenom1: document.getElementById('prenom1').value.trim(),
        classe1: document.getElementById('classe1').value.trim(),
        sexe1: document.getElementById('sexe1').value,

        nom2: document.getElementById('nom2').value.trim(),
        prenom2: document.getElementById('prenom2').value.trim(),
        classe2: document.getElementById('classe2').value.trim(),
        sexe2: document.getElementById('sexe2').value
    };
}

function validateInputs() {
    const inputs = getInputValues();
    if (!inputs.nom1 || !inputs.prenom1 || !inputs.classe1 || !inputs.sexe1) {
        alert("Veuillez remplir toutes les informations de l'élève 1.");
        return false;
    }
    if (!inputs.nom2 || !inputs.prenom2 || !inputs.classe2 || !inputs.sexe2) {
        alert("Veuillez remplir toutes les informations de l'élève 2.");
        return false;
    }
    duree = Number(document.getElementById('duree').value);
    distanceTour = Number(document.getElementById('distanceTour').value);
    vmaConnu = Number(document.getElementById('vma').value) || 0;

    if (!(duree > 0 && distanceTour > 0)) {
        alert("Veuillez renseigner une durée et une distance de tour valides.");
        return false;
    }
    return true;
}

function afficherEleveActuel() {
    const inputs = getInputValues();
    let eleveNom, elevePrenom;
    if (eleveActuel === 1) {
        eleveNom = inputs.nom1;
        elevePrenom = inputs.prenom1;
    } else {
        eleveNom = inputs.nom2;
        elevePrenom = inputs.prenom2;
    }
    eleveCourantP.textContent = elevePrenom + " " + eleveNom;
}

function startTimer() {
    tempsRestant = duree * 60;
    updateTimerDisplay();
    timerCircle.classList.remove('blink');
    timer = setInterval(() => {
        tempsRestant--;
        if (tempsRestant <= 10) {
            timerCircle.classList.add('blink');
        }
        if (tempsRestant <= 0) {
            clearInterval(timer);
            timerCircle.classList.remove('blink');
            timerDisplay.textContent = "00:00";
            finDuTemps();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const min = Math.floor(tempsRestant / 60);
    const sec = tempsRestant % 60;
    timerDisplay.textContent = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function finDuTemps() {
    plusTourCourseBtn.disabled = true;
    demarrerCourseBtn.disabled = true;
    ajoutTempsSection.classList.remove('hidden');
}

function updateCourseInfo() {
    afficherEleveActuel();
    numTourP.textContent = tourNum;
    distanceRealiseP.textContent = distanceTotal.toFixed(1);

    // vitesse = distance / temps (m/min)
    let tempsCourantMin = (duree * 60 - tempsRestant) / 60;
    let vitesse = tempsCourantMin > 0 ? distanceTotal / tempsCourantMin : 0;
    vitesseP.textContent = vitesse.toFixed(2);

    // Estimation VMA = vitesse max atteinte
    let vmaEstimee = Math.max(vitesse, courses[courseEnCours-1].vmaEstimee || 0);
    vmaEstimeeP.textContent = vmaEstimee.toFixed(2);
    courses[courseEnCours-1].vmaEstimee = vmaEstimee;
}

function resetAll() {
    clearInterval(timer);
    timer = null;
    tempsRestant = 0;
    tourNum = 0;
    distanceTotal = 0;
    courseEnCours = 0;
    eleveActuel = 1;
    courses[0] = { eleve1: {}, eleve2: {}, distance: 0, tours: 0, vitesse: 0, vmaEstimee: 0 };
    courses[1] = { eleve1: {}, eleve2: {}, distance: 0, tours: 0, vitesse: 0, vmaEstimee: 0 };

    timerDisplay.textContent = "00:00";
    timerCircle.classList.remove('blink');

    saisieSection.classList.remove('hidden');
    courseSection.classList.add('hidden');
    finSection.classList.add('hidden');

    plusTourBtn.disabled = true;
    demarrerCourseBtn.disabled = false;
    plusTourCourseBtn.disabled = true;
    ajoutTempsSection.classList.add('hidden');

    // Réafficher la saisie
    saisieSection.querySelectorAll('input, select').forEach(el => el.disabled = false);
    document.getElementById('course-info').classList.remove('hidden');
}

function startCourse() {
    if (!validateInputs()) return;

    // Désactiver la saisie
    saisieSection.querySelectorAll('input, select').forEach(el => el.disabled = true);
    document.getElementById('course-info').classList.add('hidden');

    courseEnCours = 1;
    eleveActuel = 1;
    tourNum = 0;
    distanceTotal = 0;
    tempsRestant = duree * 60;

    saisieSection.classList.add('hidden');
    courseSection.classList.remove('hidden');
    finSection.classList.add('hidden');

    demarrerCourseBtn.disabled = false;
    plusTourCourseBtn.disabled = true;
    ajoutTempsSection.classList.add('hidden');

    updateCourseInfo();
    updateTimerDisplay();
}

function switchEleve() {
    eleveActuel = eleveActuel === 1 ? 2 : 1;
    tourNum++;
    distanceTotal = tourNum * distanceTour;
    updateCourseInfo();
}

function ajouterTourPartiel(fraction) {
    distanceTotal += distanceTour * fraction;
    updateCourseInfo();
    ajoutTempsSection.classList.add('hidden');
    finSection.classList.remove('hidden');
}

function exportCSV() {
    const inputs = getInputValues();
    const data = [
        ["Élève", "Nom", "Prénom", "Classe", "Sexe", "Durée (min)", "Distance Tour (m)", "Tours", "Distance Totale (m)", "Vitesse (m/min)", "Estimation VMA (m/min)"],
        ["Élève 1", inputs.nom1, inputs.prenom1, inputs.classe1, inputs.sexe1, duree, distanceTour, courses[0].tours || 0, distanceTotal.toFixed(2), vitesseP.textContent, vmaEstimeeP.textContent],
        ["Élève 2", inputs.nom2, inputs.prenom2, inputs.classe2, inputs.sexe2, duree, distanceTour, courses[1].tours || 0, distanceTotal.toFixed(2), vitesseP.textContent, vmaEstimeeP.textContent],
    ];

    let csvContent = data.map(e => e.join(";")).join("\n");
    let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = 'runstats_export.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function generateQRCode() {
    qrcodeContainer.innerHTML = "";
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
        distanceTotal,
        vitesse: vitesseP.textContent,
        vmaEstimee: vmaEstimeeP.textContent,
        tours: tourNum
    });

    QRCode.toCanvas(qrcodeContainer, qrData, { width: 200 }, function (error) {
        if (error) console.error(error);
    });
}

demarrerBtn.addEventListener('click', startCourse);

demarrerCourseBtn.addEventListener('click', () => {
    demarrerCourseBtn.disabled = true;
    plusTourCourseBtn.disabled = false;
    startTimer();
});

plusTourCourseBtn.addEventListener('click', () => {
    switchEleve();
});

resetBtn.addEventListener('click', resetAll);
resetCourseBtn.addEventListener('click', resetAll);

exportCsvBtn.addEventListener('click', exportCSV);
qrCodeBtn.addEventListener('click', generateQRCode);

document.querySelectorAll('.ajout-temps-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        let fraction = parseFloat(btn.dataset.ajout);
        ajouterTourPartiel(fraction);
    });
});

// Au départ désactive les boutons +Tour car timer pas lancé
plusTourBtn.disabled = true;
plusTourCourseBtn.disabled = true;
