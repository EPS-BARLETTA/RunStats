// eleve.js

let currentRunner = 1;
let runnerData = { 1: {}, 2: {} };
let timerInterval;
let remainingTime; // en secondes
let totalDistance = 0;
let lapDistance = 0;
let laps = 0;

// --- DOM Elements ---
const formSection = document.getElementById('form-section');
const runSection = document.getElementById('run-section');
const runnerInfo = document.getElementById('runnerInfo');
const timerDisplay = document.getElementById('timer');
const metersDisplay = document.getElementById('meters');
const vmaDisplay = document.getElementById('vma');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const qrCodeDiv = document.getElementById('qrCode');

// --- Start Course ---
startBtn.addEventListener('click', () => {
  // Récupère infos
  runnerData[1] = {
    nom: document.getElementById('nom1').value,
    prenom: document.getElementById('prenom1').value,
    classe: document.getElementById('classe1').value,
    sexe: document.querySelector('input[name="sexe1"]:checked')?.value
  };
  runnerData[2] = {
    nom: document.getElementById('nom2').value,
    prenom: document.getElementById('prenom2').value,
    classe: document.getElementById('classe2').value,
    sexe: document.querySelector('input[name="sexe2"]:checked')?.value
  };
  
  lapDistance = parseFloat(document.getElementById('distanceTour').value) || 0;
  const duree = parseFloat(document.getElementById('duree').value) || 0;
  remainingTime = duree * 60; // convert minutes en secondes

  if (!lapDistance || !remainingTime) {
    alert("Veuillez entrer la durée et la distance du tour !");
    return;
  }

  // Basculer vers mode course
  formSection.style.display = 'none';
  runSection.style.display = 'block';
  startRunner();
});

// --- Gestion course ---
function startRunner() {
  laps = 0;
  totalDistance = 0;
  runnerInfo.textContent = `Coureur : ${runnerData[currentRunner].prenom} ${runnerData[currentRunner].nom}`;

  updateDisplays();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      endRun();
    }
    updateDisplays();
  }, 1000);
}

function updateDisplays() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  metersDisplay.textContent = `${totalDistance} m`;
  const vmaEst = (totalDistance / 1000) / (12/60); // estimation
  vmaDisplay.textContent = `${vmaEst.toFixed(1)} km/h`;
}

lapBtn.addEventListener('click', () => {
  totalDistance += lapDistance;
  laps++;
  updateDisplays();
});

resetBtn.addEventListener('click', () => {
  location.reload();
});

// --- Fin d'une course ---
function endRun() {
  runnerData[currentRunner].distance = totalDistance;

  if (currentRunner === 1) {
    // Passer au second coureur
    currentRunner = 2;
    remainingTime = parseFloat(document.getElementById('duree').value) * 60;
    totalDistance = 0;
    laps = 0;
    startRunner();
  } else {
    // Fin des 2 courses → QR Code
    showQRCode();
  }
}

function showQRCode() {
  runSection.style.display = 'none';
  qrCodeDiv.style.display = 'block';

  const qrData = {
    eleve1: runnerData[1],
    eleve2: runnerData[2]
  };

  QRCode.toCanvas(document.getElementById('qrCanvas'), JSON.stringify(qrData), { width: 200 }, function (error) {
    if (error) console.error(error);
  });
}
