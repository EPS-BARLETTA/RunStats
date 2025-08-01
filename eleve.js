// eleve.js
let dureeCourse;        // Durée totale de la course (minutes -> converti en secondes)
let distanceTour;       // Distance d'un tour en mètres
let chronoInterval;     // Interval pour le chrono
let tempsRestant;       // Temps restant en secondes
let tours = 0;          // Nombre de tours effectués
let distanceTotale = 0; // Distance totale parcourue en mètres
let vma = 0;            // Vitesse moyenne estimée en km/h
let etape = 1;          // Étape actuelle : 1 = Élève 1, 2 = Élève 2
let resultats = [];     // Tableau pour stocker les résultats des deux élèves

// --- Initialisation des éléments DOM ---
const chronoDisplay = document.getElementById("chrono");
const toursDisplay = document.getElementById("tours");
const distanceDisplay = document.getElementById("distance");
const vmaDisplay = document.getElementById("vma");
const startBtn = document.getElementById("startBtn");
const addTourBtn = document.getElementById("addTourBtn");
const resetBtn = document.getElementById("resetBtn");
const qrCanvas = document.getElementById("qrCode");

// --- Bouton Démarrer ---
startBtn.addEventListener("click", () => {
    // Lecture des paramètres
    dureeCourse = parseInt(document.getElementById("dureeCourse").value) * 60;
    distanceTour = parseFloat(document.getElementById("distanceTour").value);

    // Validation des infos
    if (!validerInfosEleve(etape)) {
        alert(`Veuillez renseigner toutes les informations pour l'élève ${etape}.`);
        return;
    }

    // Lancement du chrono
    tempsRestant = dureeCourse;
    tours = 0;
    distanceTotale = 0;
    updateAffichage();

    clearInterval(chronoInterval);
    chronoInterval = setInterval(updateChrono, 1000);

    // Désactivation du bouton Démarrer pendant la course
    startBtn.disabled = true;
});

// --- Bouton + Tour ---
addTourBtn.addEventListener("click", () => {
    tours++;
    distanceTotale = tours * distanceTour;
    calculerVMA();
    updateAffichage();
});

// --- Bouton Reset ---
resetBtn.addEventListener("click", resetCourse);

// --- Fonction : validation des infos ---
function validerInfosEleve(num) {
    const nom = document.getElementById(`nom${num}`).value.trim();
    const prenom = document.getElementById(`prenom${num}`).value.trim();
    const classe = document.getElementById(`classe${num}`).value.trim();
    const sexe = document.getElementById(`sexe${num}`).value;

    return nom && prenom && classe && sexe;
}

// --- Mise à jour du chrono ---
function updateChrono() {
    if (tempsRestant > 0) {
        tempsRestant--;
        afficherTemps(tempsRestant);
    } else {
        clearInterval(chronoInterval);
        enregistrerResultats();
    }
}

// --- Fonction affichage temps ---
function afficherTemps(secondes) {
    const minutes = Math.floor(secondes / 60);
    const sec = secondes % 60;
    chronoDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// --- Fonction calcul VMA ---
function calculerVMA() {
    // VMA = distance en km / temps en heures
    const tempsMinutes = (dureeCourse - tempsRestant) / 60; // minutes écoulées
    if (tempsMinutes > 0) {
        vma = (distanceTotale / 1000) / (tempsMinutes / 60);
    } else {
        vma = 0;
    }
}

// --- Mise à jour de l'affichage ---
function updateAffichage() {
    toursDisplay.textContent = tours;
    distanceDisplay.textContent = distanceTotale;
    vmaDisplay.textContent = vma.toFixed(2);
}

// --- Enregistrer les résultats d'un élève ---
function enregistrerResultats() {
    // Récupérer infos élève courant
    const eleve = {
        nom: document.getElementById(`nom${etape}`).value,
        prenom: document.getElementById(`prenom${etape}`).value,
        classe: document.getElementById(`classe${etape}`).value,
        sexe: document.getElementById(`sexe${etape}`).value,
        tours: tours,
        distance: distanceTotale,
        vma: vma.toFixed(2)
    };

    resultats.push(eleve);

    // Passer à l'élève suivant ou générer QR
    if (etape === 1) {
        etape = 2;
        alert("Course de l'élève 2 : Remplissez ses informations et appuyez sur Démarrer.");
        resetCourse(true); // Reset mais on conserve les résultats
    } else {
        genererQRCode();
        alert("Courses terminées ! QR Code généré.");
        startBtn.disabled = false;
    }
}

// --- Réinitialiser la course ---
function resetCourse(conserverResultats = false) {
    clearInterval(chronoInterval);
    chronoDisplay.textContent = "00:00";
    tours = 0;
    distanceTotale = 0;
    vma = 0;
    updateAffichage();
    startBtn.disabled = false;

    if (!conserverResultats) {
        resultats = [];
        etape = 1;
    }
}

// --- Génération du QR Code ---
function genererQRCode() {
    const qr = new QRious({
        element: qrCanvas,
        size: 200,
        value: JSON.stringify(resultats)
    });
}
