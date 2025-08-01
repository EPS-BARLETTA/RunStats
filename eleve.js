// eleve.js

// Variables globales
let currentRunner = 1; // 1 = élève 1, 2 = élève 2
let timers = {1: null, 2: null};
let times = {1: 0, 2: 0}; // en secondes
let laps = {1: 0, 2: 0};
let totalDistances = {1: 0, 2: 0};
let raceDuration = 0; // en minutes
let lapDistance = 0; // en mètres
let countdownInterval = null;

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startButton").addEventListener("click", startRace);
    document.getElementById("lapButton").addEventListener("click", addLap);
    document.getElementById("resetButton").addEventListener("click", resetRace);
});

// Vérifie si les infos obligatoires sont remplies
function checkInputs() {
    const name1 = document.getElementById("name1").value.trim();
    const surname1 = document.getElementById("surname1").value.trim();
    const class1 = document.getElementById("class1").value.trim();
    const gender1 = document.getElementById("gender1").value;

    const name2 = document.getElementById("name2").value.trim();
    const surname2 = document.getElementById("surname2").value.trim();
    const class2 = document.getElementById("class2").value.trim();
    const gender2 = document.getElementById("gender2").value;

    raceDuration = parseInt(document.getElementById("raceDuration").value);
    lapDistance = parseInt(document.getElementById("lapDistance").value);

    return (
        name1 && surname1 && class1 && gender1 !== "choisir" &&
        name2 && surname2 && class2 && gender2 !== "choisir" &&
        raceDuration > 0 && lapDistance > 0
    );
}

// Lancer la course
function startRace() {
    if (!checkInputs()) {
        alert("Veuillez remplir toutes les informations avant de démarrer la course.");
        return;
    }

    // Masquer formulaire & afficher minuteur
    document.querySelector(".eleve-container").style.display = "none";
    document.querySelector(".course-info").style.display = "block";

    currentRunner = 1;
    startCountdown();
}

// Compte à rebours
function startCountdown() {
    let totalSeconds = raceDuration * 60;
    updateTimerDisplay(totalSeconds);

    countdownInterval = setInterval(() => {
        totalSeconds--;
        times[currentRunner]++;

        updateTimerDisplay(totalSeconds);

        if (totalSeconds <= 0) {
            clearInterval(countdownInterval);
            endRunnerRace();
        }
    }, 1000);
}

// Affiche le minuteur
function updateTimerDisplay(secondsLeft) {
    const timer = document.getElementById("timer");
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    timer.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (secondsLeft <= 10) {
        timer.classList.add("timer-warning");
    } else {
        timer.classList.remove("timer-warning");
    }
}

// Fin de la course pour un élève
function endRunnerRace() {
    alert(`Course de l'élève ${currentRunner} terminée.`);

    if (currentRunner === 1) {
        // Passer à l'élève 2 mais attendre clic manuel
        document.getElementById("startButton").textContent = "Démarrer 2ème course";
        document.getElementById("startButton").onclick = () => {
            currentRunner = 2;
            resetTimerDisplay();
            startCountdown();
        };
    } else {
        // Les deux courses sont terminées
        generateQRCode();
    }
}

// Ajout de tour
function addLap() {
    if (lapDistance > 0) {
        laps[currentRunner]++;
        totalDistances[currentRunner] = laps[currentRunner] * lapDistance;
        updateRaceInfo();
    }
}

// Mise à jour des infos de course
function updateRaceInfo() {
    const distElem1 = document.getElementById("distance1");
    const speedElem1 = document.getElementById("speed1");

    const distElem2 = document.getElementById("distance2");
    const speedElem2 = document.getElementById("speed2");

    // Vitesse moyenne = distance (m) / temps (s) → km/h
    const speed1 = times[1] > 0 ? (totalDistances[1] / 1000) / (times[1] / 3600) : 0;
    const speed2 = times[2] > 0 ? (totalDistances[2] / 1000) / (times[2] / 3600) : 0;

    distElem1.textContent = `${totalDistances[1]} m`;
    speedElem1.textContent = `${speed1.toFixed(2)} km/h`;

    distElem2.textContent = `${totalDistances[2]} m`;
    speedElem2.textContent = `${speed2.toFixed(2)} km/h`;
}

// Réinitialisation
function resetRace() {
    clearInterval(countdownInterval);
    times = {1: 0, 2: 0};
    laps = {1: 0, 2: 0};
    totalDistances = {1: 0, 2: 0};
    document.getElementById("timer").textContent = "0:00";
    document.querySelector(".eleve-container").style.display = "flex";
    document.querySelector(".course-info").style.display = "none";
    document.getElementById("qrCode").innerHTML = "";
}

// Reset affichage minuteur
function resetTimerDisplay() {
    document.getElementById("timer").textContent = `${raceDuration}:00`;
}

// Génération QR code avec infos des 2 élèves
function generateQRCode() {
    const name1 = document.getElementById("name1").value;
    const surname1 = document.getElementById("surname1").value;
    const class1 = document.getElementById("class1").value;

    const name2 = document.getElementById("name2").value;
    const surname2 = document.getElementById("surname2").value;
    const class2 = document.getElementById("class2").value;

    const data = {
        eleve1: {
            nom: name1,
            prenom: surname1,
            classe: class1,
            distance: totalDistances[1],
            vitesse: ((totalDistances[1]/1000)/(times[1]/3600)).toFixed(2)
        },
        eleve2: {
            nom: name2,
            prenom: surname2,
            classe: class2,
            distance: totalDistances[2],
            vitesse: ((totalDistances[2]/1000)/(times[2]/3600)).toFixed(2)
        }
    };

    const qrContainer = document.getElementById("qrCode");
    qrContainer.innerHTML = "";

    const qr = new QRCode(qrContainer, {
        text: JSON.stringify(data),
        width: 200,
        height: 200
    });
}
