
// === Variables générales ===
let laps = 0;
let countdownTime, countdownTimer;
let distanceTotal = 0;
let currentCourse = 1;
let eleve1 = {}, eleve2 = {};
let qrDataArray = [];

// DOM Elements
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const chronoDisplay = document.getElementById('chronoDisplay');
const lapsCount = document.getElementById('lapsCount'); // Not used now but kept if needed
const etatForme = document.getElementById('etatForme');
const qrContainer = document.getElementById('qrContainer');
const qrCodeBox = document.getElementById('qrCodeBox');
const elevesSection = document.getElementById('elevesSection');
const profSection = document.getElementById('profSection');

const profPinInput = document.getElementById('profPinInput');
const profPinSubmit = document.getElementById('profPinSubmit');
const logoutBtn = document.getElementById('logoutBtn');
const qrScanContainer = document.getElementById('qr-scan-container');
const qrReaderDiv = document.getElementById('qr-reader');
const stopScanBtn = document.getElementById('stopScanBtn');

const resultsBody = document.getElementById('resultsBody');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const distanceTotalSpan = document.getElementById('distanceTotal');
const vitesseMoySpan = document.getElementById('vitesseMoy');
const vmaRealSpan = document.getElementById('vmaReal');

let timerRunning = false;
let startTime = 0;
let elapsedTime = 0;

let lapsTimes = [];

// === Fonctions chrono ===
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function updateChrono() {
  elapsedTime = Date.now() - startTime;
  chronoDisplay.textContent = formatTime(elapsedTime);
}

function startChrono() {
  if (timerRunning) return;
  timerRunning = true;
  startTime = Date.now() - elapsedTime;
  countdownTimer = setInterval(updateChrono, 1000);
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function addLap() {
  laps++;
  lapsTimes.push(elapsedTime);
  updateStats();
}

function resetChrono() {
  clearInterval(countdownTimer);
  timerRunning = false;
  elapsedTime = 0;
  laps = 0;
  lapsTimes = [];
  chronoDisplay.textContent = "00:00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  distanceTotalSpan.textContent = "0";
  vitesseMoySpan.textContent = "0.00";
  vmaRealSpan.textContent = "0.00";
  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  currentCourse = 1;
  qrDataArray = [];
}

// === Calculs ===
function updateStats() {
  // Récupération des données saisies
  const dureeMin = parseFloat(document.getElementById('duree').value);
  const distanceTour = parseFloat(document.getElementById('distanceTour').value);
  const vmaRef = parseFloat(document.getElementById('vmaRef').value);

  if (isNaN(dureeMin) || isNaN(distanceTour) || dureeMin <= 0) {
    alert("Merci de renseigner une durée et une distance valides.");
    resetChrono();
    return;
  }

  // Distance totale = nombre de tours * distanceTour
  distanceTotal = laps * distanceTour;
  distanceTotalSpan.textContent = distanceTotal;

  // Vitesse moyenne (km/h) = distance (km) / durée (h)
  let dureeHeures = dureeMin / 60;
  let vitesseMoy = (distanceTotal / 1000) / dureeHeures;
  vitesseMoySpan.textContent = vitesseMoy.toFixed(2);

  // VMA estimée : on calcule selon formule simple : 
  // (vitesseMoy * 0.85) si pas de vmaRef
  // Sinon on utilise la vmaRef
  let vmaEstimee = vmaRef > 0 ? vmaRef : (vitesseMoy * 0.85);
  vmaRealSpan.textContent = vmaEstimee.toFixed(2);
}

// === Gestion emoji fin course ===
function showEmojiButtons() {
  etatForme.style.display = "block";
}

function hideEmojiButtons() {
  etatForme.style.display = "none";
}

// === Gestion passage course ===
function handleEtatSelected(emoji) {
  // On récupère toutes les infos élève 1 et 2 + durée + stats
  eleve1 = {
    nom: document.getElementById('nom1').value.trim(),
    prenom: document.getElementById('prenom1').value.trim(),
    sexe: document.getElementById('sexe1').value,
    classe: document.getElementById('classe1').value.trim(),
  };
  eleve2 = {
    nom: document.getElementById('nom2').value.trim(),
    prenom: document.getElementById('prenom2').value.trim(),
    sexe: document.getElementById('sexe2').value,
    classe: document.getElementById('classe2').value.trim(),
  };

  const duree = parseFloat(document.getElementById('duree').value);
  const distance = distanceTotal;
  const vitesse = parseFloat(vitesseMoySpan.textContent);
  const vma = parseFloat(vmaRealSpan.textContent);

  if (!eleve1.nom || !eleve1.prenom || !eleve2.nom || !eleve2.prenom || isNaN(duree)) {
    alert("Veuillez remplir tous les champs des élèves et la durée.");
    return;
  }

  // Sauvegarde des données dans qrDataArray avec emoji et course courante
  qrDataArray.push({
    course: currentCourse,
    eleve1,
    eleve2,
    duree,
    distance,
    vitesse,
    vma,
    etat: emoji,
  });

  if (currentCourse === 1) {
    // Passage à la course 2 (on inverse les élèves)
    currentCourse = 2;

    // Reset des laps pour nouvelle course
    laps = 0;
    lapsTimes = [];
    elapsedTime = 0;
    chronoDisplay.textContent = "00:00";
    startBtn.disabled = false;
    lapBtn.disabled = true;
    resetBtn.disabled = true;

    // Inversion des champs élèves 1 et 2
    document.getElementById('nom1').value = eleve2.nom;
    document.getElementById('prenom1').value = eleve2.prenom;
    document.getElementById('sexe1').value = eleve2.sexe;
    document.getElementById('classe1').value = eleve2.classe;

    document.getElementById('nom2').value = eleve1.nom;
    document.getElementById('prenom2').value = eleve1.prenom;
    document.getElementById('sexe2').value = eleve1.sexe;
    document.getElementById('classe2').value = eleve1.classe;

    // Reset durée, distance tour et vmaRef
    document.getElementById('duree').value = "";
    document.getElementById('distanceTour').value = "";
    document.getElementById('vmaRef').value = "";

    hideEmojiButtons();
    alert("Passez à la course 2. Saisissez les données puis démarrez.");
  } else {
    // Fin des 2 courses, affichage QR Code avec toutes les infos
    elevesSection.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
    hideEmojiButtons();
    generateQRCode();
  }
}

// === Génération QR code ===
function generateQRCode() {
  qrContainer.style.display = "block";
  qrCodeBox.innerHTML = "";

  const dataToEncode = JSON.stringify(qrDataArray);

  new QRCode(qrCodeBox, {
    text: dataToEncode,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
}

// === Gestion boutons ===
startBtn.addEventListener('click', () => {
  startChrono();
});
lapBtn.addEventListener('click', () => {
  addLap();
});
resetBtn.addEventListener('click', () => {
  resetChrono();
});

// Emoji buttons
document.querySelectorAll('.etatBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    handleEtatSelected(btn.dataset.etat);
  });
});

// === Espace Prof ===
const profPin = "EPSVauban2025"; // code d'accès

profPinSubmit.addEventListener('click', () => {
  if (profPinInput.value === profPin) {
    alert("Accès Prof validé.");
    profPinInput.value = "";
    elevesSection.style.display = "none";
    profSection.style.display = "block";
    profPinSubmit.style.display = "none";
    profPinInput.style.display = "none";
    logoutBtn.style.display = "inline-block";
    qrScanContainer.style.display = "block";
    startQRScan();
  } else {
    alert("Code incorrect");
  }
});

logoutBtn.addEventListener('click', () => {
  stopQRScan();
  profSection.style.display = "none";
  elevesSection.style.display = "block";
  profPinSubmit.style.display = "inline-block";
  profPinInput.style.display = "inline-block";
  logoutBtn.style.display = "none";
  qrScanContainer.style.display = "none";
  resultsBody.innerHTML = "";
});

// === Scan QR code Prof ===
let html5QrCode;

function startQRScan() {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("qr-reader");
  }
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
    },
    qrCodeMessage => {
      try {
        const parsed = JSON.parse(qrCodeMessage);
        if (Array.isArray(parsed)) {
          addResultsToTable(parsed);
          stopQRScan();
        }
      } catch (e) {
        console.error("QR code non valide", e);
      }
    },
    errorMessage => {
      // console.log("QR scan error:", errorMessage);
    }
  ).catch(err => {
    alert("Erreur caméra: " + err);
  });
}

stopScanBtn.addEventListener('click', () => {
  stopQRScan();
});

function stopQRScan() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      qrReaderDiv.innerHTML = "";
    }).catch(err => {
      console.error("Erreur arrêt scan", err);
    });
  }
}

// === Ajout résultats dans tableau Prof ===
function addResultsToTable(dataArray) {
  resultsBody.innerHTML = "";
  dataArray.forEach(item => {
    // On ajoute deux lignes, une par élève
    [item.eleve1, item.eleve2].forEach(eleve => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${eleve.nom}</td>
        <td>${eleve.prenom}</td>
        <td>${eleve.sexe}</td>
        <td>${eleve.classe}</td>
        <td>${item.duree}</td>
        <td>${item.distance}</td>
        <td>${item.vitesse.toFixed(2)}</td>
        <td>${item.vma.toFixed(2)}</td>
        <td>${item.etat}</td>
      `;
      resultsBody.appendChild(tr);
    });
  });
}

// Export CSV
exportCsvBtn.addEventListener('click', () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Nom,Prénom,Sexe,Classe,Durée (min),Distance (m),Vitesse (km/h),VMA (km/h),État\n";

  [...resultsBody.children].forEach(tr => {
    const row = Array.from(tr.children).map(td => td.textContent).join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "RunStats_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// === Init ===
resetChrono();
