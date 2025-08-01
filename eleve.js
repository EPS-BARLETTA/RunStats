// eleve.js
// Gestion de la logique pour la page élèves : saisie, chrono, tours, calculs, QR code

let courseIndex = 1; // 1 = élève 1, 2 = élève 2
let tours = [0, 0]; // Nombre de tours pour chaque élève
let distanceTour = 0; // En mètres
let dureeCourse = 0; // En minutes -> converti en secondes
let timerInterval;
let tempsRestant; // En secondes

// Elements DOM
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const qrcodeEl = document.getElementById("qrcode");

// Vérifie que tous les champs sont remplis
function verifChamps() {
    const champs = [
        document.getElementById("nom1").value.trim(),
        document.getElementById("prenom1").value.trim(),
        document.getElementById("classe1").value.trim(),
        document.getElementById("sexe1").value.trim(),
        document.getElementById("nom2").value.trim(),
        document.getElementById("prenom2").value.trim(),
        document.getElementById("classe2").value.trim(),
        document.getElementById("sexe2").value.trim(),
        document.getElementById("distanceTour").value.trim(),
        document.getElementById("dureeCourse").value.trim()
    ];
    return champs.every(c => c !== "");
}

// Met à jour l’affichage des infos de course
function majInfos() {
    const distance1 = tours[0] * distanceTour;
    const distance2 = tours[1] * distanceTour;

    const tempsCourseHeures = (dureeCourse * 60) / 3600; // temps en heures

    // Vitesse moyenne = distance totale (km) / temps (h)
    const vitesse1 = tempsCourseHeures > 0 ? (distance1 / 1000) / tempsCourseHeures : 0;
    const vitesse2 = tempsCourseHeures > 0 ? (distance2 / 1000) / tempsCourseHeures : 0;

    // VMA estimée = vitesse moyenne (simplifiée)
    document.getElementById("dist1").textContent = distance1;
    document.getElementById("dist2").textContent = distance2;
    document.getElementById("vitesse1").textContent = vitesse1.toFixed(2);
    document.getElementById("vitesse2").textContent = vitesse2.toFixed(2);
    document.getElementById("vma1").textContent = vitesse1.toFixed(2);
    document.getElementById("vma2").textContent = vitesse2.toFixed(2);
}

// Formate mm:ss
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Lance le minuteur
function startTimer() {
    tempsRestant = dureeCourse * 60;
    timerEl.textContent = formatTime(tempsRestant);
    timerEl.classList.remove("hidden");

    timerInterval = setInterval(() => {
        tempsRestant--;

        // Clignotement rouge à 10 sec
        if (tempsRestant <= 10) {
            timerEl.style.color = (tempsRestant % 2 === 0) ? "red" : "#ff5555";
        } else {
            timerEl.style.color = "#000";
        }

        timerEl.textContent = formatTime(tempsRestant);

        if (tempsRestant <= 0) {
            clearInterval(timerInterval);
            finCourse();
        }
    }, 1000);
}

// Fin de course pour un élève
function finCourse() {
    alert(`Course de l'élève ${courseIndex} terminée !`);
    lapBtn.disabled = true;

    if (courseIndex === 1) {
        courseIndex = 2;
        tours[1] = 0; // reset tours pour 2e élève
        // Affiche bouton "Démarrer" pour lancer la 2e course
        startBtn.disabled = false;
        startBtn.textContent = "Démarrer élève 2";
    } else {
        // Les deux courses sont terminées -> génération QR code
        genererQRCode();
    }
}

// Ajoute un tour
function ajouterTour() {
    if (courseIndex === 1) {
        tours[0]++;
    } else {
        tours[1]++;
    }
    majInfos();
}

// Reset complet
function resetCourse() {
    clearInterval(timerInterval);
    courseIndex = 1;
    tours = [0, 0];
    timerEl.textContent = "00:00";
    timerEl.classList.add("hidden");
    startBtn.textContent = "Démarrer";
    lapBtn.disabled = true;
    majInfos();
    qrcodeEl.classList.add("hidden");
    qrcodeEl.innerHTML = "";
}

// Génération du QR code avec les infos des deux élèves
function genererQRCode() {
    const data = {
        eleve1: {
            nom: document.getElementById("nom1").value,
            prenom: document.getElementById("prenom1").value,
            classe: document.getElementById("classe1").value,
            sexe: document.getElementById("sexe1").value,
            distance: tours[0] * distanceTour
        },
        eleve2: {
            nom: document.getElementById("nom2").value,
            prenom: document.getElementById("prenom2").value,
            classe: document.getElementById("classe2").value,
            sexe: document.getElementById("sexe2").value,
            distance: tours[1] * distanceTour
        }
    };

    qrcodeEl.classList.remove("hidden");
    qrcodeEl.innerHTML = "";
    new QRCode(qrcodeEl, {
        text: JSON.stringify(data),
        width: 200,
        height: 200
    });
}

// Bouton démarrer
startBtn.addEventListener("click", () => {
    if (!verifChamps()) {
        alert("Veuillez remplir toutes les informations avant de démarrer !");
        return;
    }

    distanceTour = parseInt(document.getElementById("distanceTour").value);
    dureeCourse = parseInt(document.getElementById("dureeCourse").value);

    // Cache les saisies
    document.querySelector(".eleves-container").classList.add("hidden");
    document.querySelector(".parametres-course").classList.add("hidden");

    lapBtn.disabled = false;
    startBtn.disabled = true;

    startTimer();
});

// Bouton + Tour
lapBtn.addEventListener("click", ajouterTour);

// Bouton Reset
resetBtn.addEventListener("click", resetCourse);

// Init
lapBtn.disabled = true;
majInfos();
