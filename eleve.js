// eleve.js
// Gestion de la course pour deux élèves avec chrono, tours, calcul VMA et QR code

let timerInterval;
let tempsRestant = 0;
let tours = 0;
let distanceTour = 200;
let dureeCourse = 120;
let courseEnCours = false;

// Sélecteurs
const timerEl = document.getElementById("timer");
const lapsEl = document.getElementById("laps");
const distanceEl = document.getElementById("distance");
const vitesseEl = document.getElementById("vitesse");
const vmaEl = document.getElementById("vma");

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const qrcodeDiv = document.getElementById("qrcode");

// Lancer la course
startBtn.addEventListener("click", () => {
  if (courseEnCours) return;

  // Récupération des paramètres
  dureeCourse = parseInt(document.getElementById("dureeCourse").value) || 120;
  distanceTour = parseInt(document.getElementById("distanceTour").value) || 200;

  tempsRestant = dureeCourse;
  tours = 0;
  courseEnCours = true;
  qrcodeDiv.innerHTML = ""; // reset QR

  majStats();

  timerInterval = setInterval(() => {
    tempsRestant--;
    majStats();

    if (tempsRestant <= 0) {
      clearInterval(timerInterval);
      courseEnCours = false;
      genererQRCode();
    }
  }, 1000);
});

// Ajouter un tour
lapBtn.addEventListener("click", () => {
  if (!courseEnCours) return;
  tours++;
  majStats();
});

// Reset
resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  courseEnCours = false;
  tours = 0;
  tempsRestant = 0;
  qrcodeDiv.innerHTML = "";
  majStats();
});

// Mise à jour stats
function majStats() {
  const tempsEcoule = dureeCourse - tempsRestant;
  const distanceTotale = tours * distanceTour; // en mètres
  const vitesseMoyenne = tempsEcoule > 0 ? (distanceTotale / tempsEcoule) * 3.6 : 0; // km/h
  const vma = vitesseMoyenne.toFixed(1); // estimation simple

  timerEl.textContent = tempsRestant;
  lapsEl.textContent = tours;
  distanceEl.textContent = distanceTotale;
  vitesseEl.textContent = vitesseMoyenne.toFixed(1);
  vmaEl.textContent = vma;
}

// Génération QR Code
function genererQRCode() {
  const data = {
    eleve1: {
      nom: document.getElementById("nom1").value,
      prenom: document.getElementById("prenom1").value,
      classe: document.getElementById("classe1").value,
      sexe: document.getElementById("sexe1").value
    },
    eleve2: {
      nom: document.getElementById("nom2").value,
      prenom: document.getElementById("prenom2").value,
      classe: document.getElementById("classe2").value,
      sexe: document.getElementById("sexe2").value
    },
    stats: {
      dureeCourse,
      distanceTour,
      tours,
      distanceTotale: tours * distanceTour,
      vma: parseFloat(vmaEl.textContent)
    }
  };

  const jsonStr = JSON.stringify(data);

  // Création du QR Code via l'API Google Chart
  const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(jsonStr)}`;
  qrcodeDiv.innerHTML = `<img src="${qrUrl}" alt="QR Code Résultats">`;
}
