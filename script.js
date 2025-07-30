// Variables course
let timeElapsed = 0;
let isRunning = false;
let laps = 0;
let timerInterval = null;
let etatSelectionne = "";

let dataGroupe = {
  eleve1: null,
  eleve2: null
};

const resultsData = [];
let html5QrCode = null;
let profPin = "7890";

// DOM elements
const chronoDisplay = document.getElementById("chronoDisplay");
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapsCount = document.getElementById("lapsCount");

const nom1 = document.getElementById("nom1");
const prenom1 = document.getElementById("prenom1");
const classe1 = document.getElementById("classe1");

const nom2 = document.getElementById("nom2");
const prenom2 = document.getElementById("prenom2");
const classe2 = document.getElementById("classe2");

const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaRefInput = document.getElementById("vmaRef");

const etatFormeDiv = document.getElementById("etatForme");
const etatButtons = document.querySelectorAll(".etatBtn");

const distanceTotalEl = document.getElementById("distanceTotal");
const distanceKmEl = document.getElementById("distanceKm");
const vitesseMoyEl = document.getElementById("vitesseMoy");
const vmaRealEl = document.getElementById("vmaReal");

const qrCodeBox = document.getElementById("qrCodeBox");

const profDashboard = document.getElementById("profDashboard");
const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const qrReaderDiv = document.getElementById("qr-reader");
const resultsBody = document.getElementById("resultsBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const footer = document.getElementById("footer");

// Helpers
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateChrono() {
  timeElapsed++;
  chronoDisplay.textContent = formatTime(timeElapsed);
  let totalSec = parseInt(dureeInput.value) * 60;
  if (totalSec - timeElapsed <= 10 && totalSec - timeElapsed > 0) {
    chronoDisplay.classList.add("red");
  } else {
    chronoDisplay.classList.remove("red");
  }
  if (timeElapsed >= totalSec) stopCourse();
}

function startCourse() {
  if (!nom1.value || !prenom1.value || !classe1.value || !nom2.value || !prenom2.value || !classe2.value) {
    alert("Merci de remplir les informations des deux élèves.");
    return;
  }

  if (isRunning) return;

  isRunning = true;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  timeElapsed = 0;
  laps = 0;
  chronoDisplay.textContent = "00:00";
  lapsCount.textContent = 0;
  etatFormeDiv.style.display = "none";
  timerInterval = setInterval(updateChrono, 1000);
}

function stopCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  lapBtn.disabled = true;
  startBtn.disabled = false;
  etatFormeDiv.style.display = "block";
}

function resetCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  laps = 0;
  timeElapsed = 0;
  chronoDisplay.textContent = "00:00";
  lapsCount.textContent = 0;
  etatFormeDiv.style.display = "none";
  chronoDisplay.classList.remove("red");
  distanceTotalEl.textContent = 0;
  distanceKmEl.textContent = "0.00";
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  qrCodeBox.innerHTML = "";
}

function addLap() {
  if (!isRunning) return;
  laps++;
  lapsCount.textContent = laps;
  updateStats();
}

function updateStats() {
  let distanceTot = laps * Number(distanceTourInput.value);
  let dureeH = timeElapsed / 3600;
  let vitesse = dureeH > 0 ? distanceTot / 1000 / dureeH : 0;
  let vmaReal = vitesse * 1.05;

  distanceTotalEl.textContent = distanceTot;
  distanceKmEl.textContent = (distanceTot / 1000).toFixed(2);
  vitesseMoyEl.textContent = vitesse.toFixed(2);
  vmaRealEl.textContent = vmaReal.toFixed(2);
}

etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    etatSelectionne = btn.getAttribute("data-etat");
    alert("État sélectionné : " + etatSelectionne);
    generateQrCode();
  });
});

function generateQrCode() {
  const data = {
    eleve1: {
      nom: nom1.value,
      prenom: prenom1.value,
      classe: classe1.value
    },
    eleve2: {
      nom: nom2.value,
      prenom: prenom2.value,
      classe: classe2.value
    },
    duree: dureeInput.value,
    distance: distanceTotalEl.textContent,
    vitesse: vitesseMoyEl.textContent,
    vma: vmaRealEl.textContent,
    etat: etatSelectionne
  };

  const qrData = JSON.stringify(data);
  qrCodeBox.innerHTML = "";
  new QRCode(qrCodeBox, {
    text: qrData,
    width: 200,
    height: 200
  });
}

// Mode Prof
profPinSubmit.addEventListener("click", () => {
  if (profPinInput.value === profPin) {
    profDashboard.style.display = "block";
    startQrScanner();
  } else {
    alert("Code PIN incorrect");
  }
});

function startQrScanner() {
  if (html5QrCode) return;

  html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        resultsData.push(data);
        renderResults();
        alert("QR Code scanné avec succès !");
      } catch {
        alert("QR code invalide.");
      }
    },
    () => {}
  ).catch(err => {
    alert("Erreur lancement scanner : " + err);
  });
}

stopScanBtn.addEventListener("click", () => {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    });
  }
});

function renderResults() {
  resultsBody.innerHTML = "";
  resultsData.forEach((groupe, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Groupe ${i + 1}</td>
      <td>${groupe.eleve1.nom} ${groupe.eleve1.prenom}</td>
      <td>${groupe.eleve2.nom} ${groupe.eleve2.prenom}</td>
      <td>${groupe.classe}</td>
      <td>${groupe.duree}</td>
      <td>${groupe.distance}</td>
      <td>${groupe.vitesse}</td>
      <td>${groupe.vma}</td>
      <td>${groupe.etat}</td>
    `;
    resultsBody.appendChild(tr);
  });
}

exportCsvBtn.addEventListener("click", () => {
  if (resultsData.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  const headers = ["Groupe", "Élève 1", "Élève 2", "Classe", "Durée", "Distance", "Vitesse", "VMA", "État"];
  const rows = resultsData.map((g, i) => [
    `Groupe ${i + 1}`,
    `${g.eleve1.nom} ${g.eleve1.prenom}`,
    `${g.eleve2.nom} ${g.eleve2.prenom}`,
    g.eleve1.classe || g.eleve2.classe,
    g.duree,
    g.distance,
    g.vitesse,
    g.vma,
    g.etat
  ].join(";"));

  const csv = [headers.join(";"), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_groupes.csv";
  a.click();
});

startBtn.addEventListener("click", startCourse);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetCourse);

// Footer accès prof
let clickCount = 0;
footer.addEventListener("click", () => {
  clickCount++;
  if (clickCount >= 3) {
    document.getElementById("profAccess").style.display = "block";
    clickCount = 0;
  }
  setTimeout(() => clickCount = 0, 1500);
});
