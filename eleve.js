// eleve.js

// Éléments DOM
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const addLapBtn = document.getElementById('addLapBtn');
const timerDisplay = document.getElementById('timer');
const resultatsDiv = document.getElementById('resultats');
const formSection = document.getElementById('form-section');
const courseSection = document.getElementById('course-section');
const qrSection = document.getElementById('qr-section');
const qrcodeContainer = document.getElementById('qrcode');

let duree = 0; // durée en minutes
let distanceTour = 0; // distance en mètres
let vmaKnown = 0;

let timerInterval = null;
let startTime = null;

let laps = 0;
let totalDistance = 0;

let currentRun = 1; // 1 ou 2 pour les deux courses

let eleve1 = {};
let eleve2 = {};

let results = []; // stocke résultats des deux courses

// Fonction format MM:SS
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// Validation formulaire
function validateInputs() {
    eleve1.nom = document.getElementById('nom1').value.trim();
    eleve1.prenom = document.getElementById('prenom1').value.trim();
    eleve1.classe = document.getElementById('classe1').value.trim();
    eleve1.sexe = document.getElementById('sexe1').value;

    eleve2.nom = document.getElementById('nom2').value.trim();
    eleve2.prenom = document.getElementById('prenom2').value.trim();
    eleve2.classe = document.getElementById('classe2').value.trim();
    eleve2.sexe = document.getElementById('sexe2').value;

    duree = Number(document.getElementById('duree').value);
    distanceTour = Number(document.getElementById('distanceTour').value);
    vmaKnown = Number(document.getElementById('vma').value);

    if (!eleve1.nom || !eleve1.prenom || !eleve1.classe || !eleve1.sexe) {
        alert("Veuillez remplir tous les champs pour Élève 1");
        return false;
    }
    if (!eleve2.nom || !eleve2.prenom || !eleve2.classe || !eleve2.sexe) {
        alert("Veuillez remplir tous les champs pour Élève 2");
        return false;
    }
    if (!(duree > 0 && distanceTour > 0)) {
        alert("Veuillez renseigner une durée et une distance valides (>0)");
        return false;
    }
    return true;
}

// Démarrer la course
function startCourse() {
    if (!validateInputs()) return;

    // Cacher form et afficher section course
    formSection.style.display = 'none';
    courseSection.style.display = 'block';
    qrSection.style.display = 'none';

    laps = 0;
    totalDistance = 0;
    timerDisplay.textContent = formatTime(duree * 60 * 1000);
    resultatsDiv.textContent = `Course ${currentRun} : Élève ${currentRun === 1 ? "1 court" : "2 court"}`;

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 200);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const remaining = duree * 60 * 1000 - elapsed;

    if (remaining <= 0) {
        timerDisplay.textContent = "00:00";
        clearInterval(timerInterval);
        finishRun();
    } else {
        timerDisplay.textContent = formatTime(remaining);
    }
}

// Ajouter un tour
function addLap() {
    laps++;
    totalDistance = laps * distanceTour;

    // Vitesse instantanée approximée (m/min)
    let elapsed = Date.now() - startTime;
    let minutesElapsed = elapsed / 60000;
    let vitesse = minutesElapsed > 0 ? (totalDistance / minutesElapsed).toFixed(2) : 0;

    // Estimation VMA (simplifiée) = vitesse max = vitesse instantanée max observée
    // On stocke la vitesse max pour la course en cours
    if (!results[currentRun - 1]) results[currentRun - 1] = {};
    if (!results[currentRun - 1].maxVitesse || vitesse > results[currentRun - 1].maxVitesse) {
        results[currentRun - 1].maxVitesse = vitesse;
    }

    // Affichage résultats intermédiaires
    resultatsDiv.textContent = `
Course ${currentRun} : Élève ${currentRun === 1 ? "1 court" : "2 court"}

Tours effectués: ${laps}
Distance parcourue: ${totalDistance.toFixed(2)} m
Vitesse moyenne: ${vitesse} m/min
Estimation VMA: ${results[currentRun - 1].maxVitesse.toFixed(2)} m/min
    `;
}

// Fin de la course actuelle
function finishRun() {
    clearInterval(timerInterval);

    // Sauvegarde des données
    if (!results[currentRun - 1]) results[currentRun - 1] = {};

    let courantEleve = currentRun === 1 ? eleve1 : eleve2;

    results[currentRun - 1].nom = courantEleve.nom;
    results[currentRun - 1].prenom = courantEleve.prenom;
    results[currentRun - 1].classe = courantEleve.classe;
    results[currentRun - 1].sexe = courantEleve.sexe;
    results[currentRun - 1].distance = totalDistance.toFixed(2);
    // Estimation VMA en km/h (m/min * 60 / 1000)
    results[currentRun - 1].vmaEstimee = (results[currentRun - 1].maxVitesse * 60 / 1000).toFixed(2);

    if (currentRun === 1) {
        // Passer à la 2e course
        currentRun = 2;
        // Reset pour la 2e course
        laps = 0;
        totalDistance = 0;
        resultatsDiv.textContent = "";
        timerDisplay.textContent = formatTime(duree * 60 * 1000);
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 200);
        alert("Course 1 terminée. Maintenant Élève 2 court.");
    } else {
        // Fin des 2 courses : affichage QR code
        showQRcode();
    }
}

// Génération QR code avec infos des deux élèves
function showQRcode() {
    courseSection.style.display = 'none';
    qrSection.style.display = 'block';

    // Préparation texte QR code
    const data = {
        eleve1: results[0],
        eleve2: results[1]
    };

    const qrText = 
`Élève 1: ${data.eleve1.nom} ${data.eleve1.prenom} - Classe: ${data.eleve1.classe} - Sexe: ${data.eleve1.sexe}
Distance parcourue: ${data.eleve1.distance} m
VMA estimée: ${data.eleve1.vmaEstimee} km/h

Élève 2: ${data.eleve2.nom} ${data.eleve2.prenom} - Classe: ${data.eleve2.classe} - Sexe: ${data.eleve2.sexe}
Distance parcourue: ${data.eleve2.distance} m
VMA estimée: ${data.eleve2.vmaEstimee} km/h
`;

    qrcodeContainer.innerHTML = "";
    new QRCode(qrcodeContainer, {
        text: qrText,
        width: 250,
        height: 250,
    });
}

// Réinitialisation
function reset() {
    clearInterval(timerInterval);
    laps = 0;
    totalDistance = 0;
    currentRun = 1;
    results = [];
    formSection.style.display = 'block';
    courseSection.style.display = 'none';
    qrSection.style.display = 'none';

    timerDisplay.textContent = "00:00";
    resultatsDiv.textContent = "";
}

startBtn.addEventListener('click', startCourse);
addLapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', reset);
