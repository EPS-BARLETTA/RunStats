// eleve.js

let currentStudent = 1; // 1 = élève 1, 2 = élève 2
let timers = { 1: null, 2: null };
let remainingTime = { 1: 0, 2: 0 };
let laps = { 1: 0, 2: 0 };
let lapDistance = 200; // par défaut
let totalDistance = { 1: 0, 2: 0 };
let startTime = { 1: null, 2: null };
let isRunning = false;

// Récupère les inputs
const durationInput = document.getElementById("courseDuration");
const distanceInput = document.getElementById("lapDistance");

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");

// Démarrer la course (élève 1 puis élève 2)
startBtn.addEventListener("click", () => {
  if (isRunning) return;

  lapDistance = parseFloat(distanceInput.value);
  const durationMinutes = parseFloat(durationInput.value);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    alert("Veuillez entrer une durée valide.");
    return;
  }

  resetStats();
  currentStudent = 1;
  startRaceForStudent(1, durationMinutes * 60);
});

// Bouton + Tour
lapBtn.addEventListener("click", () => {
  if (!isRunning) return;
  laps[currentStudent]++;
  updateStats(currentStudent);
});

// Bouton Reset
resetBtn.addEventListener("click", () => {
  resetStats();
  clearInterval(timers[1]);
  clearInterval(timers[2]);
  document.getElementById("qrcode").innerHTML = "";
  isRunning = false;
});

// ----- FONCTIONS -----

function startRaceForStudent(studentId, durationSec) {
  isRunning = true;
  remainingTime[studentId] = durationSec;
  startTime[studentId] = Date.now();

  timers[studentId] = setInterval(() => {
    remainingTime[studentId]--;
    updateTimeDisplay(studentId);

    if (remainingTime[studentId] <= 0) {
      clearInterval(timers[studentId]);
      isRunning = false;

      // Si c'était élève 1, on passe à élève 2
      if (studentId === 1) {
        currentStudent = 2;
        startRaceForStudent(2, parseFloat(durationInput.value) * 60);
      } else {
        // Les deux ont fini → générer QR Code
        generateQRCode();
      }
    }
  }, 1000);
}

function updateTimeDisplay(studentId) {
  const min = Math.floor(remainingTime[studentId] / 60);
  const sec = remainingTime[studentId] % 60;
  document.getElementById(`time${studentId}`).textContent =
    `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateStats(studentId) {
  totalDistance[studentId] = laps[studentId] * lapDistance;
  document.getElementById(`laps${studentId}`).textContent = laps[studentId];
  document.getElementById(`distance${studentId}`).textContent = totalDistance[studentId];

  const elapsed = (parseFloat(durationInput.value) * 60) - remainingTime[studentId];
  const vitesse = elapsed > 0 ? (totalDistance[studentId] / elapsed) * 3.6 : 0; // m/s → km/h
  document.getElementById(`vitesse${studentId}`).textContent = vitesse.toFixed(1);

  const vma = vitesse * 1.1; // estimation simplifiée (10% en +)
  document.getElementById(`vma${studentId}`).textContent = vma.toFixed(1);
}

function resetStats() {
  [1, 2].forEach(id => {
    laps[id] = 0;
    totalDistance[id] = 0;
    remainingTime[id] = 0;
    document.getElementById(`time${id}`).textContent = "--:--";
    document.getElementById(`laps${id}`).textContent = "0";
    document.getElementById(`distance${id}`).textContent = "0";
    document.getElementById(`vitesse${id}`).textContent = "0";
    document.getElementById(`vma${id}`).textContent = "0";
  });
}

// Génération du QR Code
function generateQRCode() {
  const data = {
    eleve1: {
      nom: document.getElementById("nom1").value,
      prenom: document.getElementById("prenom1").value,
      classe: document.getElementById("classe1").value,
      sexe: document.getElementById("sexe1").value,
      distance: totalDistance[1],
      tours: laps[1],
      vma: document.getElementById("vma1").textContent
    },
    eleve2: {
      nom: document.getElementById("nom2").value,
      prenom: document.getElementById("prenom2").value,
      classe: document.getElementById("classe2").value,
      sexe: document.getElementById("sexe2").value,
      distance: totalDistance[2],
      tours: laps[2],
      vma: document.getElementById("vma2").textContent
    }
  };

  const jsonData = JSON.stringify(data);
  document.getElementById("qrcode").innerHTML = "";
  QRCode.toCanvas(document.getElementById("qrcode"), jsonData, function (error) {
    if (error) console.error(error);
  });
}
