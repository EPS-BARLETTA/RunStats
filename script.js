// --- Variables course ---
let timerInterval;
let timeElapsed = 0;
let isRunning = false;
let laps = 0;

// --- DOM elements ---
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const distanceTotalEl = document.getElementById("distanceTotal");
const vitesseMoyEl = document.getElementById("vitesseMoy");
const vmaRealEl = document.getElementById("vmaReal");

const nomInput = document.getElementById("nom");
const prenomInput = document.getElementById("prenom");
const classeInput = document.getElementById("classe");
const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaRefInput = document.getElementById("vmaRef");

const etatButtons = document.querySelectorAll(".etatBtn");
const etatFormeDiv = document.getElementById("etatForme");

const qrCodeContainer = document.getElementById("qrcode");

// Mode prof
const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const profDashboard = document.getElementById("profDashboard");
const studentInput = document.getElementById("studentInput");
const qrReaderDiv = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const resultsBody = document.getElementById("resultsBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

// PIN prof
const PROF_PIN = "7890";

// Etat sélectionné
let etatSelectionne = "";

// Résultats scannés
let scannedResults = [];

// Instance scanner
let html5QrCode = null;

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
  const totalSec = Number(dureeInput.value) * 60;
  if (totalSec && totalSec - timeElapsed <= 10 && totalSec - timeElapsed > 0) {
    chronoDisplay.classList.add("red");
  } else {
    chronoDisplay.classList.remove("red");
  }
  if (totalSec && timeElapsed >= totalSec) {
    stopCourse();
  }
}

// Démarrer la course
function startCourse() {
  if (!nomInput.value || !prenomInput.value || !classeInput.value || !dureeInput.value || !distanceTourInput.value) {
    alert("Veuillez remplir nom, prénom, classe, durée et distance tour.");
    return;
  }
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  timeElapsed = 0;
  laps = 0;
  lapsCount.textContent = laps;
  distanceTotalEl.textContent = 0;
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  chronoDisplay.textContent = "00:00";
  generateQRCode();
  timerInterval = setInterval(() => {
    updateChrono();
    generateQRCode();
  }, 1000);
}

// Arrêter la course
function stopCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  etatFormeDiv.style.display = "block";
  generateQRCode(); // Final QR code
}

// Ajouter un tour
function addLap() {
  if (!isRunning) return;
  laps++;
  lapsCount.textContent = laps;
  updateStats();
  generateQRCode();
}

// Reset course
function resetCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  timeElapsed = 0;
  laps = 0;
  lapsCount.textContent = laps;
  distanceTotalEl.textContent = 0;
  vitesseMoyEl.textContent = "0.00";
  vmaRealEl.textContent = "0.00";
  chronoDisplay.textContent = "00:00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = false;
  etatFormeDiv.style.display = "none";
  etatSelectionne = "";
  chronoDisplay.classList.remove("red");
  generateQRCode();
}

// Calcul stats
function updateStats() {
  const distanceTot = laps * Number(distanceTourInput.value);
  const dureeH = timeElapsed / 3600;
  const vitesse = dureeH > 0 ? distanceTot / 1000 / dureeH : 0;
  const vmaReal = vitesse * 1.05; // +5% approx
  distanceTotalEl.textContent = distanceTot;
  vitesseMoyEl.textContent = vitesse.toFixed(2);
  vmaRealEl.textContent = vmaReal.toFixed(2);
}

// Gestion état forme
etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    etatSelectionne = btn.getAttribute("data-etat");
    alert(`État sélectionné : ${etatSelectionne}`);
    generateQRCode();
  });
});

// Générer QR code JSON
function generateQRCode() {
  const QRCodeLib = window.QRCode; // vérifier que la lib est bien chargée
  if (!QRCodeLib) return;
  qrCodeContainer.innerHTML = ""; // reset

  const data = {
    nom: nomInput.value,
    prenom: prenomInput.value,
    classe: classeInput.value,
    duree: dureeInput.value,
    distance: laps * Number(distanceTourInput.value),
    vitesse: vitesseMoyEl.textContent,
    vma: parseFloat(vmaRealEl.textContent),
    etat: etatSelectionne || "non défini",
  };
  new QRCodeLib(qrCodeContainer, {
    text: JSON.stringify(data),
    width: 180,
    height: 180,
  });
}

// --- Mode Prof ---

// Afficher mode prof
function showProfDashboard(show) {
  if(show) {
    profDashboard.style.display = "block";
    studentInput.style.display = "none";
    startQrScanner();
  } else {
    profDashboard.style.display = "none";
    studentInput.style.display = "block";
    stopQrScanner();
  }
}

// Vérification PIN prof
profPinSubmit.addEventListener("click", () => {
  if(profPinInput.value === PROF_PIN) {
    profPinInput.value = "";
    showProfDashboard(true);
  } else {
    alert("Code PIN incorrect.");
  }
});

// Scanner QR code avec Html5Qrcode
function startQrScanner() {
  if(html5QrCode) return;
  html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (qrMessage) => {
      try {
        const data = JSON.parse(qrMessage);
        if(validateData(data)) {
          addScannedResult(data);
          alert(`Données reçues: ${data.nom} ${data.prenom}`);
        } else {
          alert("Données invalides dans le QR code.");
        }
      } catch {
        alert("QR code non reconnu.");
      }
    },
    (error) => {
      // console.log("Scan error", error);
    }
  ).catch(err => {
    alert("Erreur démarrage scanner : " + err);
  });
}

function stopQrScanner() {
  if(html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    }).catch(err => {
      console.log("Erreur arrêt scanner : ", err);
    });
  }
}

stopScanBtn.addEventListener("click", () => {
  stopQrScanner();
});

// Validation données scannées
function validateData(d) {
  return d.nom && d.prenom && d.classe && d.duree && d.distance !== undefined && d.vitesse !== undefined && d.vma !== undefined && d.etat;
}

// Ajouter résultat scanné
function addScannedResult(data) {
  // Vérifier doublon (nom+prenom)
  if(scannedResults.some(r => r.nom === data.nom && r.prenom === data.prenom)) {
    alert(`Résultat déjà ajouté pour ${data.nom} ${data.prenom}`);
    return;
  }
  scannedResults.push(data);
  sortAndDisplayResults();
}

// Trier + afficher résultats regroupés
function sortAndDisplayResults() {
  // Trier par VMA décroissante
  scannedResults.sort((a,b) => b.vma - a.vma);

// Classification VMA en haute, intermédiaire, faible
function classifyVMA(vma) {
  if (vma >= 16) return "haute";
  if (vma >= 12) return "intermédiaire";
  return "faible";
}

// Regrouper élèves par groupes de 4 hétérogènes : 1 haute, 1 faible, 2 intermédiaires
function createGroups(results) {
  const haute = results.filter(r => classifyVMA(r.vma) === "haute");
  const inter = results.filter(r => classifyVMA(r.vma) === "intermédiaire");
  const faible = results.filter(r => classifyVMA(r.vma) === "faible");

  const groups = [];
  // Créer autant de groupes que possible
  const nbGroupes = Math.floor(results.length / 4);

  for (let i = 0; i < nbGroupes; i++) {
    const groupe = [];

    // 1 VMA haute
    if (haute.length > 0) groupe.push(haute.shift());
    // 1 VMA faible
    if (faible.length > 0) groupe.push(faible.shift());
    // 2 intermédiaires
    for (let j = 0; j < 2; j++) {
      if (inter.length > 0) groupe.push(inter.shift());
      else if (haute.length > 0) groupe.push(haute.shift());
      else if (faible.length > 0) groupe.push(faible.shift());
    }
    groups.push(groupe);
  }

  // Ajouter les restes non groupés dans un groupe spécial si besoin
  const rest = [...haute, ...inter, ...faible];
  if (rest.length > 0) groups.push(rest);

  return groups;
}

// Afficher résultats dans tableau
function sortAndDisplayResults() {
  // Trier par VMA décroissante
  scannedResults.sort((a,b) => b.vma - a.vma);

  // Effacer tableau
  resultsBody.innerHTML = "";

  // Créer groupes
  const groupes = createGroups(scannedResults);

  groupes.forEach((groupe, i) => {
    // Ligne titre groupe
    const trTitre = document.createElement("tr");
    const tdTitre = document.createElement("td");
    tdTitre.colSpan = 8;
    tdTitre.style.fontWeight = "bold";
    tdTitre.style.backgroundColor = "#ddd";
    tdTitre.textContent = `Groupe ${i + 1}`;
    trTitre.appendChild(tdTitre);
    resultsBody.appendChild(trTitre);

    groupe.forEach(el => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${el.nom}</td>
        <td>${el.prenom}</td>
        <td>${el.classe}</td>
        <td>${el.duree} min</td>
        <td>${el.distance} m</td>
        <td>${el.vitesse}</td>
        <td>${el.vma.toFixed(2)}</td>
        <td>${el.etat}</td>
      `;
      resultsBody.appendChild(tr);
    });
  });
}

// Export CSV
function exportCSV() {
  if (scannedResults.length === 0) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const groupes = createGroups(scannedResults);

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Groupe,Nom,Prénom,Classe,Durée (min),Distance (m),Vitesse (km/h),VMA,État\n";

  groupes.forEach((groupe, i) => {
    groupe.forEach(el => {
      const row = [
        i + 1,
        el.nom,
        el.prenom,
        el.classe,
        el.duree,
        el.distance,
        el.vitesse,
        el.vma.toFixed(2),
        el.etat,
      ].join(",");
      csvContent += row + "\n";
    });
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "resultats_courses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Bouton export CSV
exportCsvBtn.addEventListener("click", exportCSV);

// Événements boutons course
startBtn.addEventListener("click", startCourse);
lapBtn.addEventListener("click", addLap);
resetBtn.addEventListener("click", resetCourse);

// Initial setup
lapBtn.disabled = true;
resetBtn.disabled = false;
etatFormeDiv.style.display = "none";
generateQRCode();
