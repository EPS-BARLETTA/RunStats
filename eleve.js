// eleve.js
// Gestion des courses des élèves et QR code

let currentRunner = 1;
let timers = [null, null];
let timeLeft = [0, 0];
let timerInterval = null;
let lapCounts = [0, 0];
let raceData = [null, null];
let raceSettings = { duration: 0, lapDistance: 0 };
let qrGenerated = false;

// DOM
const inputsContainer = document.getElementById("inputs-container");
const raceInfoContainer = document.getElementById("race-info");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const lapBtn = document.getElementById("lap-btn");
const resetBtn = document.getElementById("reset-btn");
const qrCodeContainer = document.getElementById("qrcode");

// Fonction pour démarrer une course
function startRace() {
    // Vérifier que toutes les infos sont remplies
    if (!validateInputs()) {
        alert("Veuillez remplir toutes les informations avant de démarrer la course.");
        return;
    }

    // Cacher les infos de saisie et afficher le minuteur
    inputsContainer.style.display = "none";
    raceInfoContainer.style.display = "none";
    timerDisplay.style.display = "block";

    // Initialisation du chrono
    timeLeft[currentRunner - 1] = raceSettings.duration * 60;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft[currentRunner - 1]--;
        updateTimerDisplay();

        if (timeLeft[currentRunner - 1] <= 0) {
            clearInterval(timerInterval);
            finishCurrentRunner();
        }
    }, 1000);
}

// Fonction pour mettre à jour l'affichage du minuteur
function updateTimerDisplay() {
    let t = timeLeft[currentRunner - 1];
    let minutes = Math.floor(t / 60);
    let seconds = t % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    // Clignotement en rouge si moins de 10s
    if (t <= 10) {
        timerDisplay.classList.add("blink");
    } else {
        timerDisplay.classList.remove("blink");
    }
}

// Valider les infos
function validateInputs() {
    let nom1 = document.getElementById("nom1").value.trim();
    let prenom1 = document.getElementById("prenom1").value.trim();
    let classe1 = document.getElementById("classe1").value.trim();
    let sexe1 = document.getElementById("sexe1").value;

    let nom2 = document.getElementById("nom2").value.trim();
    let prenom2 = document.getElementById("prenom2").value.trim();
    let classe2 = document.getElementById("classe2").value.trim();
    let sexe2 = document.getElementById("sexe2").value;

    let distance = document.getElementById("distance").value;
    let duree = document.getElementById("duree").value;

    if (!nom1 || !prenom1 || !classe1 || !sexe1 || !nom2 || !prenom2 || !classe2 || !sexe2 || !distance || !duree) {
        return false;
    }

    raceSettings.lapDistance = parseFloat(distance);
    raceSettings.duration = parseInt(duree);

    return true;
}

// Ajouter un tour
function addLap() {
    lapCounts[currentRunner - 1]++;
    updateRaceInfo();
}

// Réinitialiser tout
function resetRace() {
    clearInterval(timerInterval);
    currentRunner = 1;
    lapCounts = [0, 0];
    qrGenerated = false;

    inputsContainer.style.display = "block";
    raceInfoContainer.style.display = "block";
    timerDisplay.style.display = "none";

    document.getElementById("info1").textContent = "";
    document.getElementById("info2").textContent = "";
    qrCodeContainer.innerHTML = "";
}

// Mettre à jour les infos de course
function updateRaceInfo() {
    let distanceParcourue = lapCounts[currentRunner - 1] * raceSettings.lapDistance;
    let tempsCourse = raceSettings.duration * 60 - timeLeft[currentRunner - 1];
    let vitesse = tempsCourse > 0 ? (distanceParcourue / (tempsCourse / 60)).toFixed(2) : 0;

    document.getElementById(`info${currentRunner}`).textContent =
        `Tours: ${lapCounts[currentRunner - 1]}, Distance: ${distanceParcourue} m, Vitesse: ${vitesse} m/min`;
}

// Quand un coureur termine
function finishCurrentRunner() {
    let distanceParcourue = lapCounts[currentRunner - 1] * raceSettings.lapDistance;
    let tempsCourse = raceSettings.duration * 60;
    let vitesse = (distanceParcourue / (tempsCourse / 60)).toFixed(2);
    let vma = (distanceParcourue / 1000 / (tempsCourse / 3600)).toFixed(2);

    raceData[currentRunner - 1] = {
        nom: document.getElementById(`nom${currentRunner}`).value.trim(),
        prenom: document.getElementById(`prenom${currentRunner}`).value.trim(),
        classe: document.getElementById(`classe${currentRunner}`).value.trim(),
        sexe: document.getElementById(`sexe${currentRunner}`).value,
        tours: lapCounts[currentRunner - 1],
        distance: distanceParcourue,
        vitesse: vitesse,
        vma: vma
    };

    if (currentRunner === 1) {
        // Passer manuellement à Élève 2
        alert("Course Élève 1 terminée. Cliquez sur 'Démarrer' pour lancer la course Élève 2.");
        currentRunner = 2;
        inputsContainer.style.display = "block";
        raceInfoContainer.style.display = "block";
        timerDisplay.style.display = "none";
        lapCounts[1] = 0;
    } else {
        // Course terminée pour les deux
        alert("Course Élève 2 terminée. Génération du QR Code...");
        generateQRCode();
    }
}

// Générer QR code
function generateQRCode() {
    if (qrGenerated) return;

    let data = {
        eleve1: raceData[0],
        eleve2: raceData[1]
    };

    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, {
        text: JSON.stringify(data),
        width: 256,
        height: 256
    });

    qrGenerated = true;
}

// Écouteurs
startBtn.addEventListener("click", startRace);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetRace);
