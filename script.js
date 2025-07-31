// Variables globales
let chronoInterval;
let startTime;
let elapsed = 0;
let laps = 0;
let courseNum = 1; // course 1 ou 2
let results = [];

const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaRefInput = document.getElementById("vmaRef");

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");

const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");

const distanceTotalDisplay = document.getElementById("distanceTotal");
const vitesseMoyDisplay = document.getElementById("vitesseMoy");
const vmaRealDisplay = document.getElementById("vmaReal");

const etatFormeDiv = document.getElementById("etatForme");
const etatBtns = document.querySelectorAll(".etatBtn");

const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const logoutBtn = document.getElementById("logoutBtn");
const profDashboard = document.getElementById("profDashboard");
const resultsBody = document.getElementById("resultsBody");
const qrReaderDiv = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const CODE_PROF = "EPS2025";

let html5QrcodeScanner;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}

function updateChrono() {
  const now = Date.now();
  elapsed = now - startTime;
  chronoDisplay.textContent = formatTime(elapsed);
  const dureeMs = (parseInt(dureeInput.value) || 0) * 60 * 1000;
  if (elapsed >= dureeMs) {
    clearInterval(chronoInterval);
    finishCourse();
  }
}

function startChrono() {
  if (!dureeInput.value || !distanceTourInput.value) {
    alert("Veuillez saisir la durée et la distance d'un tour.");
    return;
  }
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  startTime = Date.now() - elapsed;
  chronoInterval = setInterval(updateChrono, 250);
}

function addLap() {
  laps++;
  lapsCount.textContent = `${laps} tour${laps>1?"s":""}`;
  updateStats();
}

function resetChrono() {
  clearInterval(chronoInterval);
  elapsed = 0;
  laps = 0;
  chronoDisplay.textContent = "00:00";
  lapsCount.textContent = "0 tours";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  resetStats();
  etatFormeDiv.style.display = "none";
  qrContainer.style.display = "none";
}

function updateStats() {
  const dureeMin = (elapsed / 1000) / 60;
  const distanceTotal = laps * (parseFloat(distanceTourInput.value) || 0);
  const vitesseMoy = dureeMin > 0 ? (distanceTotal / 1000) / (dureeMin / 60) : 0; // km/h
  const vmaEstimee = vitesseMoy * 1.2; // simple estimation

  distanceTotalDisplay.textContent = Math.round(distanceTotal);
  vitesseMoyDisplay.textContent = vitesseMoy.toFixed(2);
  vmaRealDisplay.textContent = vmaEstimee.toFixed(2);
}

function resetStats() {
  distanceTotalDisplay.textContent = "0";
  vitesseMoyDisplay.textContent = "0.00";
  vmaRealDisplay.textContent = "0.00";
}

function finishCourse() {
  clearInterval(chronoInterval);
  startBtn.disabled = true;
  lapBtn.disabled = true;
  resetBtn.disabled = false;
  etatFormeDiv.style.display = "flex"; // afficher le choix emoji
}

function saveResult(etat) {
  const eleve1 = {
    nom: document.getElementById("nom1").value.trim(),
    prenom: document.getElementById("prenom1").value.trim(),
    sexe: document.getElementById("sexe1").value,
    classe: document.getElementById("classe1").value.trim(),
  };
  const eleve2 = {
    nom: document.getElementById("nom2").value.trim(),
    prenom: document.getElementById("prenom2").value.trim(),
    sexe: document.getElementById("sexe2").value,
    classe: document.getElementById("classe2").value.trim(),
  };

  const duree = parseInt(dureeInput.value);
  const distanceTour = parseFloat(distanceTourInput.value);
  const lapsCount = laps;
  const distanceTotal = lapsCount * distanceTour;
  const vitesseMoy = (distanceTotal / 1000) / (duree / 60);
  const vmaEstimee = vitesseMoy * 1.2;

  results.push({
    courseNum,
    eleve1,
    eleve2,
    duree,
    laps: lapsCount,
    distanceTotal,
    vitesseMoy,
    vmaEstimee,
    etat,
  });

  etatFormeDiv.style.display = "none";

  if (courseNum === 1) {
    courseNum = 2;
    alert("Passage à la 2ème course.\nMerci de saisir les données des élèves inversées.");
    resetChrono();
  } else {
    showQRCode();
  }
}

function showQRCode() {
  qrContainer.style.display = "block";
  qrCodeBox.innerHTML = "";
  // Crée un objet JSON avec les données des 2 courses
  const dataToEncode = JSON.stringify(results);
  new QRCode(qrCodeBox, {
    text: dataToEncode,
    width: 200,
    height: 200,
  });
}

// Gestion des boutons état
etatBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const etat = btn.dataset.etat;
    saveResult(etat);
  });
});

// Gestion des boutons chrono
startBtn.addEventListener("click", () => {
  startChrono();
});

lapBtn.addEventListener("click", () => {
  addLap();
});

resetBtn.addEventListener("click", () => {
  resetChrono();
});

// Partie Professeur

function showProfLogin() {
  profPinInput.style.display = "inline-block";
  profPinSubmit.style.display = "inline-block";
  logoutBtn.style.display = "none";
  profDashboard.style.display = "none";
}

profPinSubmit.addEventListener("click", () => {
  const pin = profPinInput.value.trim();
  if (pin === CODE_PROF) {
    profDashboard.style.display = "block";
    profPinInput.style.display = "none";
    profPinSubmit.style.display = "none";
    logoutBtn.style.display = "inline-block";
    startScanning();
  } else {
    alert("Code professeur incorrect");
  }
});

logoutBtn.addEventListener("click", () => {
  profDashboard.style.display = "none";
  showProfLogin();
  stopScanning();
});

// QR Code scanner partie Prof
function onScanSuccess(decodedText, decodedResult) {
  try {
    const newResults = JSON.parse(decodedText);
    if (Array.isArray(newResults)) {
      newResults.forEach(r => {
        // Ajouter sans doublons (simple check par nom/prenom/course)
        if (!results.some(existing => existing.courseNum === r.courseNum &&
          existing.eleve1.nom === r.eleve1.nom && existing.eleve1.prenom === r.eleve1.prenom)) {
          results.push(r);
        }
      });
      refreshResultsTable();
      alert("Résultats ajoutés !");
    } else {
      alert("QR Code invalide.");
    }
  } catch(e) {
    alert("Erreur lors de la lecture du QR Code.");
  }
}

function refreshResultsTable() {
  resultsBody.innerHTML = "";
  results.forEach((r, i) => {
    // 2 élèves, on affiche en 2 lignes
    const tr1 = document.createElement("tr");
    tr1.innerHTML = `
      <td>${i*2+1}</td>
      <td>${r.eleve1.nom}</td>
      <td>${r.eleve1.prenom}</td>
      <td>${r.eleve1.sexe}</td>
      <td>${r.eleve1.classe}</td>
      <td>${r.duree}</td>
      <td>${Math.round(r.distanceTotal)}</td>
      <td>${r.vitesseMoy.toFixed(2)}</td>
      <td>${r.vmaEstimee.toFixed(2)}</td>
      <td>${r.etat}</td>
    `;
    const tr2 = document.createElement("tr");
    tr2.innerHTML = `
      <td>${i*2+2}</td>
      <td>${r.eleve2.nom}</td>
      <td>${r.eleve2.prenom}</td>
      <td>${r.eleve2.sexe}</td>
      <td>${r.eleve2.classe}</td>
      <td>${r.duree}</td>
      <td>${Math.round(r.distanceTotal)}</td>
      <td>${r.vitesseMoy.toFixed(2)}</td>
      <td>${r.vmaEstimee.toFixed(2)}</td>
      <td>${r.etat}</td>
    `;
    resultsBody.appendChild(tr1);
    resultsBody.appendChild(tr2);
  });
}

function startScanning() {
  if (html5QrcodeScanner) return; // déjà lancé
  html5QrcodeScanner = new Html5Qrcode("qr-reader");
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    onScanSuccess
  ).catch(err => {
    console.error("Erreur scan QR:", err);
  });
}

function stopScanning() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }).catch(err => console.error(err));
  }
}

stopScanBtn.addEventListener("click", () => {
  stopScanning();
});

// Export CSV
exportCsvBtn.addEventListener("click", () => {
  if (results.length === 0) {
    alert("Aucun résultat à exporter.");
    return;
  }
  let csv = "Num;Nom;Prénom;Sexe;Classe;Durée(min);Distance totale(m);Vitesse moy(km/h);VMA estimée;État forme\n";
  results.forEach((r, i) => {
    csv += `${i*2+1};${r.eleve1.nom};${r.eleve1.prenom};${r.eleve1.sexe};${r.eleve1.classe};${r.duree};${Math.round(r.distanceTotal)};${r.vitesseMoy.toFixed(2)};${r.vmaEstimee.toFixed(2)};${r.etat}\n`;
    csv += `${i*2+2};${r.eleve2.nom};${r.eleve2.prenom};${r.eleve2.sexe};${r.eleve2.classe};${r.duree};${Math.round(r.distanceTotal)};${r.vitesseMoy.toFixed(2)};${r.vmaEstimee.toFixed(2)};${r.etat}\n`;
  });

  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "RunStats_Results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Initialisation
resetChrono();
showProfLogin();
