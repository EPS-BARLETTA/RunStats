// eleve.js

const startBtn = document.getElementById("startBtn");
const plusTourBtn = document.getElementById("plusTourBtn");
const resetBtn = document.getElementById("resetBtn");
const courseSection = document.getElementById("courseSection");
const timerEl = document.getElementById("timer");
const nbToursEl = document.getElementById("nbTours");
const distanceParcourueEl = document.getElementById("distanceParcourue");
const vitesseMoyenneEl = document.getElementById("vitesseMoyenne");
const vmaEstimeeEl = document.getElementById("vmaEstimee");
const eleveInfoEl = document.createElement("div");

eleveInfoEl.id = "eleveInfo";
courseSection.insertBefore(eleveInfoEl, timerEl);

let dureeCourseMin;
let distanceTourM;
let vmaConnue = 0;

let currentEleveIndex = 0; // 0 = élève1, 1 = élève2
let tours = [0, 0];
let startTime = null;
let timerInterval = null;
let courseActive = false;

const eleves = [
  { nom: "", prenom: "", classe: "", sexe: "" },
  { nom: "", prenom: "", classe: "", sexe: "" },
];

startBtn.addEventListener("click", () => {
  if (courseActive) return;

  // Récupérer et valider les infos
  eleves[0].nom = document.getElementById("nom1").value.trim();
  eleves[0].prenom = document.getElementById("prenom1").value.trim();
  eleves[0].classe = document.getElementById("classe1").value.trim();
  eleves[0].sexe = document.getElementById("sexe1").value;

  eleves[1].nom = document.getElementById("nom2").value.trim();
  eleves[1].prenom = document.getElementById("prenom2").value.trim();
  eleves[1].classe = document.getElementById("classe2").value.trim();
  eleves[1].sexe = document.getElementById("sexe2").value;

  dureeCourseMin = parseFloat(document.getElementById("dureeCourse").value);
  distanceTourM = parseFloat(document.getElementById("distanceTour").value);
  const vmaVal = document.getElementById("vmaConnue").value;
  vmaConnue = vmaVal ? parseFloat(vmaVal) : 0;

  if (
    !eleves[0].nom || !eleves[0].prenom || !eleves[0].sexe ||
    !eleves[1].nom || !eleves[1].prenom || !eleves[1].sexe ||
    isNaN(dureeCourseMin) || dureeCourseMin <= 0 ||
    isNaN(distanceTourM) || distanceTourM <= 0
  ) {
    alert("Merci de remplir tous les champs obligatoires correctement.");
    return;
  }

  // Cacher les inputs
  document.getElementById("inputSection").style.display = "none";
  document.getElementById("courseInputs").style.display = "none";
  startBtn.style.display = "none";

  // Afficher la section course
  courseSection.style.display = "block";

  // Initialiser course 1
  currentEleveIndex = 0;
  tours = [0, 0];
  startCourse();
});

plusTourBtn.addEventListener("click", () => {
  if (!courseActive) return;
  tours[currentEleveIndex]++;
  updateStats();
});

resetBtn.addEventListener("click", () => {
  if (!courseActive) return;
  tours[currentEleveIndex] = 0;
  updateStats();
});

function startCourse() {
  eleveInfoEl.textContent = `Course de : ${eleves[currentEleveIndex].prenom} ${eleves[currentEleveIndex].nom}`;
  tours[currentEleveIndex] = 0;
  updateStats();
  startTime = Date.now();
  courseActive = true;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsedMs = Date.now() - startTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const totalSec = dureeCourseMin * 60;
  const remainingSec = totalSec - elapsedSec;

  if (remainingSec <= 0) {
    timerEl.textContent = "00:00";
    endCourse();
  } else {
    const min = String(Math.floor(remainingSec / 60)).padStart(2, "0");
    const sec = String(remainingSec % 60).padStart(2, "0");
    timerEl.textContent = `${min}:${sec}`;
  }
}

function updateStats() {
  nbToursEl.textContent = tours[currentEleveIndex];
  const dist = tours[currentEleveIndex] * distanceTourM;
  distanceParcourueEl.textContent = dist.toFixed(1);

  const elapsedHr = (Date.now() - startTime) / (1000 * 3600);
  const vitesse = elapsedHr > 0 ? dist / 1000 / elapsedHr : 0; // km/h
  vitesseMoyenneEl.textContent = vitesse.toFixed(2);

  // VMA estimée = vitesse moyenne + 10% (approximative)
  const vmaEstimee = vmaConnue > 0 ? Math.max(vitesse, vmaConnue) : vitesse * 1.1;
  vmaEstimeeEl.textContent = vmaEstimee.toFixed(2);
}

function endCourse() {
  clearInterval(timerInterval);
  courseActive = false;

  if (currentEleveIndex === 0) {
    // Passage au second élève
    alert(`Fin de la course de ${eleves[0].prenom} ${eleves[0].nom}. Passez à la course du second élève.`);
    currentEleveIndex = 1;
    startCourse();
  } else {
    // Fin des deux courses => afficher QR code avec les données
    alert(`Fin de la course de ${eleves[1].prenom} ${eleves[1].nom}. Génération du QR code.`);
    generateQRCode();
  }
}

function generateQRCode() {
  // Rassembler les données
  const data = {
    eleve1: {
      nom: eleves[0].nom,
      prenom: eleves[0].prenom,
      sexe: eleves[0].sexe,
      distanceParcourue: (tours[0] * distanceTourM).toFixed(1),
      vmaEstimee: vmaConnue > 0 ? Math.max(parseFloat(vmaEstimeeEl.textContent), vmaConnue).toFixed(2) : vmaEstimeeEl.textContent,
    },
    eleve2: {
      nom: eleves[1].nom,
      prenom: eleves[1].prenom,
      sexe: eleves[1].sexe,
      distanceParcourue: (tours[1] * distanceTourM).toFixed(1),
      vmaEstimee: vmaConnue > 0 ? Math.max(parseFloat(vmaEstimeeEl.textContent), vmaConnue).toFixed(2) : vmaEstimeeEl.textContent,
    },
  };

  // Nettoyer l’affichage course
  courseSection.innerHTML = `<h3>Résultats finaux</h3><div id="qrcode"></div>`;

  const qrCodeContainer = document.getElementById("qrcode");

  QRCode.toCanvas(qrCodeContainer, JSON.stringify(data), { width: 250 }, function (error) {
    if (error) {
      alert("Erreur lors de la génération du QR code");
      console.error(error);
    }
  });
}
