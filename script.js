// Variables course
let timerInterval;
let timeElapsed = 0; // en secondes
let isRunning = false;
let laps = 0;

// Elements DOM
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

// Mode prof elements
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

// Variables Mode Prof
let profPin = localStorage.getItem("profPin") || "0000";
let isProfLoggedIn = false;
let html5QrCode;
let resultsData = [];

// Format temps mm:ss
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}

// Mise à jour chrono
function updateChrono() {
  timeElapsed++;
  chronoDisplay.textContent = formatTime(timeElapsed);
  // Rouge quand < 10 secondes restantes
  let totalSec = parseInt(dureeInput.value)*60;
  if(totalSec && totalSec - timeElapsed <= 10 && totalSec - timeElapsed > 0) {
    chronoDisplay.classList.add("red");
  } else {
    chronoDisplay.classList.remove("red");
  }

  if(totalSec && timeElapsed >= totalSec) {
    stopCourse();
  }
}

// Démarrer course
function startCourse() {
  if(!nomInput.value || !prenomInput.value || !classeInput.value || !dureeInput.value || !distanceTourInput.value) {
    alert("Merci de remplir nom, prénom, classe, durée et distance tour.");
    return;
  }
  if(isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  timeElapsed = 0;
  laps = 0;
  lapsCount.textContent = laps;
  distanceTotalEl.textContent = 0;
  distanceKmEl.textContent = "0.00";
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  chronoDisplay.textContent = "00:00";
  timerInterval = setInterval(updateChrono, 1000);
}

// Arrêter course (fin du temps)
function stopCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  etatFormeDiv.style.display = "block";
}

// Ajouter un tour
function addLap() {
  if(!isRunning) return;
  laps++;
  lapsCount.textContent = laps;
  updateStats();
}

// Reset tout
function resetCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  timeElapsed = 0;
  laps = 0;
  lapsCount.textContent = laps;
  distanceTotalEl.textContent = 0;
  distanceKmEl.textContent = "0.00";
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  chronoDisplay.textContent = "00:00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = false;
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  chronoDisplay.classList.remove("red");
}

// Calcul stats vitesse moyenne et VMA réalisée
function updateStats() {
  let distanceTot = laps * Number(distanceTourInput.value);
  let dureeH = timeElapsed / 3600;
  let vitesse = dureeH > 0 ? distanceTot / 1000 / dureeH : 0;
  let vmaRef = Number(vmaRefInput.value);
  let vmaReal = vitesse * 1.05; // estimation VMA à partir vitesse moyenne (ex: +5%)

  distanceTotalEl.textContent = distanceTot;
  distanceKmEl.textContent = distanceTot / 1000.toFixed(2);
  vitesseMoyEl.textContent = vitesse.toFixed(2);
  vmaRealEl.textContent = vmaReal.toFixed(2);
}

// Gestion état forme
let etatSelectionne = "";
etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    etatSelectionne = btn.getAttribute("data-etat");
    alert(`État sélectionné : ${etatSelectionne}`);
  });
});

// --- Mode Prof ---

// Afficher ou cacher mode prof
function showProfDashboard(show) {
  if(show) {
    profDashboard.style.display = "block";
    studentInput.style.display = "none";
  } else {
    profDashboard.style.display = "none";
    studentInput.style.display = "block";
  }
}

// Validation PIN prof
profPinSubmit.addEventListener("click", () => {
  if(profPinInput.value === profPin) {
    isProfLoggedIn = true;
    showProfDashboard(true);
    profPinInput.value = "";
    changePinBtn.style.display = "inline-block";
    qrScanContainer.style.display = "block";
    startQrScanner();
    renderResultsTable();
  } else {
    alert("Code PIN incorrect.");
  }
});

// Changer PIN
changePinBtn.addEventListener("click", () => {
  let newPin = prompt("Entrez un nouveau code PIN à 4 chiffres :", profPin);
  if(newPin && /^\d{4}$/.test(newPin)) {
    profPin = newPin;
    localStorage.setItem("profPin", profPin);
    alert("Code PIN changé avec succès.");
  } else {
    alert("Code PIN invalide. Il doit contenir exactement 4 chiffres.");
  }
});

// Gestion QR Scanner

function startQrScanner() {
  if (html5QrCode) return; // déjà lancé

  html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      // Traiter le texte scanné (format JSON)
      try {
        const data = JSON.parse(qrCodeMessage);
        if(validateData(data)) {
          addResult(data);
          alert(`Données reçues de : ${data.nom} ${data.prenom}`);
        } else {
          alert("Données invalides dans le QR code.");
        }
      } catch {
        alert("QR code non reconnu.");
      }
    },
    errorMessage => {
      // Pas besoin d'afficher erreurs fréquentes
    }
  ).catch(err => {
    alert(`Erreur démarrage scanner : ${err}`);
  });
}

function stopQrScanner() {
  if(html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    });
  }
}

stopScanBtn.addEventListener("click", () => {
  stopQrScanner();
});

// Validation données reçues
function validateData(data) {
  return data.nom && data.prenom && data.classe && data.duree && data.distance && data.vitesse && data.vma && data.etat;
}

// Ajouter résultat au tableau
function addResult(data) {
  resultsData.push(data);
  sortResults();
  renderResultsTable();
}

// Trier résultats par nom alphabétique
function sortResults() {
  resultsData.sort((a,b) => a.nom.localeCompare(b.nom));
}

// Afficher tableau résultats
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

// Exporter les résultats en CSV
exportCsvBtn.addEventListener("click", () => {
  if (resultsData.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  const headers = ["Nom", "Prénom", "Classe", "Durée (min)", "Distance (m)", "Vitesse (km/h)", "VMA (km/h)", "État"];
  const rows = resultsData.map(d =>
    [d.nom, d.prenom, d.classe, d.duree, d.distance, d.vitesse, d.vma, d.etat].join(";")
  );

  const csvContent = [headers.join(";"), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "resultats_runstats.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Boutons course
startBtn.addEventListener("click", startCourse);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetCourse);

// Accès mode prof si triple clic pied de page
let footerClickCount = 0;
footer.addEventListener("click", () => {
  footerClickCount++;
  if (footerClickCount >= 3) {
    footerClickCount = 0;
    showProfDashboard(true);
  }
  setTimeout(() => (footerClickCount = 0), 1500); // reset après 1,5s
});
