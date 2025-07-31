let laps = 0;
let countdownTime = 0;
let countdownTimer = null;
let distanceTotal = 0;

let course1Done = false;
let eleve1 = {};
let eleve2 = {};

const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const chronoDisplay = document.getElementById('chronoDisplay');

startBtn.addEventListener('click', () => {
  const duree = parseFloat(document.getElementById('duree').value);
  const distanceTour = parseFloat(document.getElementById('distanceTour').value);
  const prenom1 = document.getElementById('prenom1').value.trim();
  const nom1 = document.getElementById('nom1').value.trim();
  const sexe1 = document.getElementById('sexe1').value;
  const prenom2 = document.getElementById('prenom2').value.trim();
  const nom2 = document.getElementById('nom2').value.trim();
  const sexe2 = document.getElementById('sexe2').value;

  if (!prenom1 || !nom1 || !sexe1 || !prenom2 || !nom2 || !sexe2) {
    alert("Veuillez renseigner prénom, nom et sexe pour les deux élèves.");
    return;
  }

  if (!duree || !distanceTour) {
    alert("Veuillez renseigner la durée et la distance du tour.");
    return;
  }

  // Init course
  laps = 0;
  distanceTotal = 0;
  countdownTime = duree * 60;
  course1Done = false;
  eleve1 = {prenom: prenom1, nom: nom1, sexe: sexe1};
  eleve2 = {prenom: prenom2, nom: nom2, sexe: sexe2};

  lapBtn.disabled = false;
  resetBtn.disabled = false;
  startBtn.disabled = true;

  updateDisplayTime(countdownTime);
  updateStats();
  startCountdown();
});

lapBtn.addEventListener('click', () => {
  const distanceTour = parseFloat(document.getElementById('distanceTour').value);
  laps++;
  distanceTotal = laps * distanceTour;
  updateStats();
});

resetBtn.addEventListener('click', () => {
  clearInterval(countdownTimer);
  countdownTimer = null;
  laps = 0;
  distanceTotal = 0;
  countdownTime = 0;

  chronoDisplay.textContent = "00:00";
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  startBtn.disabled = false;

  // Reset inputs if needed
  updateStats();
  document.getElementById('etatForme').style.display = "none";
  document.getElementById('qrContainer').style.display = "none";
});

function startCountdown() {
  countdownTimer = setInterval(() => {
    if (countdownTime <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      showEtatForme();
      return;
    }
    countdownTime--;
    updateDisplayTime(countdownTime);
    updateStats();
  }, 1000);
}

function updateDisplayTime(seconds) {
  let min = String(Math.floor(seconds / 60)).padStart(2, '0');
  let sec = String(seconds % 60).padStart(2, '0');
  chronoDisplay.textContent = `${min}:${sec}`;
  if (seconds <= 10) {
    chronoDisplay.style.color = 'red';
  } else {
    chronoDisplay.style.color = 'black';
  }
}

function updateStats() {
  const duree = parseFloat(document.getElementById('duree').value);
  const distanceKm = distanceTotal / 1000;
  const tempsHeure = duree / 60;

  // Eviter division par zero
  const vitesseMoy = (tempsHeure > 0) ? (distanceKm / tempsHeure).toFixed(2) : 0;

  // VMA estimée = vitesse moyenne * facteur (par défaut 1.1)
  const vmaRef = parseFloat(document.getElementById('vmaRef').value) || 0;
  const facteurVMA = 1.1;
  let vmaEstimee = 0;
  if (vmaRef > 0) {
    vmaEstimee = Math.min(vmaRef, vitesseMoy * facteurVMA).toFixed(2);
  }

  document.getElementById('distanceTotal').textContent = distanceTotal;
  document.getElementById('vitesseMoy').textContent = vitesseMoy;
  document.getElementById('vmaReal').textContent = vmaEstimee;
}

function showEtatForme() {
  document.getElementById('etatForme').style.display = "block";

  // Disable lap button after end
  lapBtn.disabled = true;

  // Listen for emoji selection
  document.querySelectorAll('.etatBtn').forEach(btn => {
    btn.onclick = () => {
      const etat = btn.getAttribute('data-etat');

      // Compile data for QR code
      const data = {
        eleve1,
        eleve2,
        laps,
        distanceTotal,
        vitesseMoy: document.getElementById('vitesseMoy').textContent,
        vmaEstimee: document.getElementById('vmaReal').textContent,
        etat,
      };

      generateQRCode(JSON.stringify(data));
      document.getElementById('qrContainer').style.display = "block";

      // Hide état forme buttons to prevent reselect
      document.getElementById('etatForme').style.display = "none";
    };
  });
}

function generateQRCode(dataStr) {
  const qrBox = document.getElementById('qrCodeBox');
  qrBox.innerHTML = "";
  new QRCode(qrBox, {
    text: dataStr,
    width: 200,
    height: 200,
    colorDark : "#000000",
    colorLight : "#ffffff",
  });
}
