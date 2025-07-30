// === VARIABLES COURSE ===
let timerInterval;
let timeElapsed = 0;
let isRunning = false;
let laps = 0;
let etatSelectionne = "";

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const distanceTotalEl = document.getElementById("distanceTotal");
const distanceKmEl = document.getElementById("distanceKm");
const vitesseMoyEl = document.getElementById("vitesseMoy");
const vmaRealEl = document.getElementById("vmaReal");
const etatFormeDiv = document.getElementById("etatForme");
const etatButtons = document.querySelectorAll(".etatBtn");

const nomInput = document.getElementById("nom");
const prenomInput = document.getElementById("prenom");
const classeInput = document.getElementById("classe");
const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaRefInput = document.getElementById("vmaRef");
const footer = document.getElementById("footer");

// === MODE PROF ===
const profDashboard = document.getElementById("profDashboard");
const studentInput = document.getElementById("studentInput");
const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const changePinBtn = document.getElementById("changePinBtn");
const qrScanContainer = document.getElementById("qr-scan-container");
const qrReaderDiv = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const resultsBody = document.getElementById("resultsBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

let profPin = localStorage.getItem("profPin") || "0000";
let isProfLoggedIn = false;
let html5QrCode;
let resultsData = [];

// === FONCTIONS COURSE ===
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateChrono() {
  timeElapsed++;
  chronoDisplay.textContent = formatTime(timeElapsed);
  const totalSec = parseInt(dureeInput.value) * 60;

  if (totalSec - timeElapsed <= 10 && totalSec - timeElapsed > 0) {
    chronoDisplay.classList.add("red");
  } else {
    chronoDisplay.classList.remove("red");
  }

  if (totalSec && timeElapsed >= totalSec) {
    stopCourse();
  }
}

function startCourse() {
  if (!nomInput.value || !prenomInput.value || !classeInput.value || !dureeInput.value || !distanceTourInput.value) {
    alert("Merci de remplir tous les champs !");
    return;
  }
  if (isRunning) return;

  isRunning = true;
  timeElapsed = 0;
  laps = 0;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  updateStats();
  chronoDisplay.textContent = "00:00";
  timerInterval = setInterval(updateChrono, 1000);
}

function stopCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  etatFormeDiv.style.display = "block";
}

function addLap() {
  if (!isRunning) return;
  laps++;
  updateStats();
}

function resetCourse() {
  clearInterval(timerInterval);
  timeElapsed = 0;
  laps = 0;
  isRunning = false;
  lapsCount.textContent = "0";
  chronoDisplay.textContent = "00:00";
  distanceTotalEl.textContent = "0";
  distanceKmEl.textContent = "0.00";
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = false;
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  chronoDisplay.classList.remove("red");
}

function updateStats() {
  const tour = Number(distanceTourInput.value);
  const dist = laps * tour;
  const dureeHeure = timeElapsed / 3600;
  const vitesse = dureeHeure > 0 ? dist / 1000 / dureeHeure : 0;
  const vmaReal = vitesse * 1.05;

  lapsCount.textContent = laps;
  distanceTotalEl.textContent = dist;
  distanceKmEl.textContent = (dist / 1000).toFixed(2);
  vitesseMoyEl.textContent = vitesse.toFixed(2);
  vmaRealEl.textContent = vmaReal.toFixed(2);
}

// === ÉTAT DE FORME ===
etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    etatSelectionne = btn.dataset.etat;
    alert(`État sélectionné : ${etatSelectionne}`);
  });
});

// === MODE PROF ===
function showProfDashboard(show) {
  profDashboard.style.display = show ? "block" : "none";
  studentInput.style.display = show ? "none" : "block";
}

profPinSubmit.addEventListener("click", () => {
  if (profPinInput.value === profPin) {
    showProfDashboard(true);
    profPinInput.value = "";
    startQrScanner();
    renderResultsTable();
  } else {
    alert("Code incorrect !");
  }
});

changePinBtn.addEventListener("click", () => {
  const newPin = prompt("Nouveau code PIN (4 chiffres) :", profPin);
  if (newPin && /^\d{4}$/.test(newPin)) {
    profPin = newPin;
    localStorage.setItem("profPin", profPin);
    alert("Code PIN mis à jour !");
  } else {
    alert("Format invalide.");
  }
});

function startQrScanner() {
  if (html5QrCode) return;

  html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    qrCodeMessage => {
      try {
        const data = JSON.parse(qrCodeMessage);
        if (validateData(data)) {
          addResult(data);
          alert(`Ajout : ${data.nom} ${data.prenom}`);
        } else {
          alert("QR invalide !");
        }
      } catch {
        alert("QR non reconnu");
      }
    },
    () => {}
  ).catch(err => {
    alert("Erreur scanner : " + err);
  });
}

function stopQrScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    });
  }
}

stopScanBtn.addEventListener("click", stopQrScanner);

function validateData(data) {
  return data.nom && data.prenom && data.classe && data.duree && data.distance && data.vitesse && data.vma && data.etat;
}

function addResult(data) {
  resultsData.push(data);
  resultsData.sort((a, b) => a.nom.localeCompare(b.nom));
  renderResultsTable();
}

function renderResultsTable() {
  resultsBody.innerHTML = "";
  resultsData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.nom}</td>
      <td>${row.prenom}</td>
      <td>${row.classe}</td>
      <td>${row.duree}</td>
      <td>${row.distance}</td>
      <td>${row.vitesse}</td>
      <td>${row.vma}</td>
      <td>${row.etat}</td>
    `;
    resultsBody.appendChild(tr);
  });
}

exportCsvBtn.addEventListener("click", () => {
  if (resultsData.length === 0) {
    alert("Aucune donnée à exporter !");
    return;
  }
  const header = "Nom;Prénom;Classe;Durée (min);Distance (m);Vitesse (km/h);VMA (km/h);État";
  const lignes = resultsData.map(d =>
    [d.nom, d.prenom, d.classe, d.duree, d.distance, d.vitesse, d.vma, d.etat].join(";")
  );
  const contenu = [header, ...lignes].join("\n");
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const lien = document.createElement("a");
  lien.setAttribute("href", url);
  lien.setAttribute("download", "resultats_runstats.csv");
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
});

// === ÉVÉNEMENTS ===
startBtn.addEventListener("click", startCourse);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetCourse);

let footerClick = 0;
footer.addEventListener("click", () => {
  footerClick++;
  if (footerClick >= 3) {
    footerClick = 0;
    showProfDashboard(true);
  }
  setTimeout(() => (footerClick = 0), 1500);
});
