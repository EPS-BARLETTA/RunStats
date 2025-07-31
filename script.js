// --- Variables globales ---
let timer;
let time = 0;
let laps = 0;
let etat = "";
let dureeSec = 0;

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const etatForme = document.getElementById("etatForme");
const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

const eleve1Input = document.getElementById("eleve1");
const eleve2Input = document.getElementById("eleve2");
const classeInput = document.getElementById("classe");
const dureeInput = document.getElementById("duree");
const distanceInput = document.getElementById("distance");
const vmaInput = document.getElementById("vma");

const profAccess = document.getElementById("profAccess");
const pinInput = document.getElementById("pinInput");
const pinSubmit = document.getElementById("pinSubmit");
const profDashboard = document.getElementById("profDashboard");
const startScanBtn = document.getElementById("startScanBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const scanResult = document.getElementById("scanResult");
const dataTableBody = document.getElementById("dataTableBody");
const generateGroupsBtn = document.getElementById("generateGroupsBtn");
const groupsDisplay = document.getElementById("groupsDisplay");

let scannedData = [];
let qrScanner; // Scanner instance (from library)

// --- Fonctions utilitaires ---

function formatTime(t) {
  const minutes = Math.floor(t / 60);
  const seconds = t % 60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function updateDisplay() {
  chronoDisplay.textContent = formatTime(time);
  lapsCount.textContent = laps;
  // Change couleur chrono dans les 10 dernières secondes
  if (dureeSec - time <= 10 && dureeSec - time > 0) {
    chronoDisplay.classList.add("orange");
    chronoDisplay.classList.remove("red");
  } else if (time >= dureeSec) {
    chronoDisplay.classList.add("red");
    chronoDisplay.classList.remove("orange");
  } else {
    chronoDisplay.classList.remove("orange");
    chronoDisplay.classList.remove("red");
  }
}

// --- Chrono ---

startBtn.addEventListener("click", () => {
  const dureeMin = parseFloat(dureeInput.value);
  if (!dureeMin || dureeMin <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }
  if (!eleve1Input.value.trim() || !eleve2Input.value.trim() || !classeInput.value.trim() || !distanceInput.value) {
    alert("Merci de remplir tous les champs requis.");
    return;
  }

  dureeSec = Math.floor(dureeMin * 60);
  time = 0;
  laps = 0;
  etat = "";

  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  chronoDisplay.classList.remove("red", "orange");

  updateDisplay();

  timer = setInterval(() => {
    time++;
    updateDisplay();

    if (time >= dureeSec) {
      clearInterval(timer);
      lapBtn.disabled = true;
      etatForme.style.display = "block"; // Affiche les boutons d’état
    }
  }, 1000);
});

lapBtn.addEventListener("click", () => {
  laps++;
  updateDisplay();
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  time = 0;
  laps = 0;
  etat = "";

  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;

  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";
  chronoDisplay.classList.remove("red", "orange");

  updateDisplay();
});

// --- Etat forme et génération QR ---

document.querySelectorAll("#etatForme button").forEach(btn => {
  btn.addEventListener("click", () => {
    etat = btn.dataset.etat;
    etatForme.style.display = "none";

    // Calculs
    const dureeCourse = dureeInput.value;
    const distance = parseFloat(distanceInput.value);
    const vitesse = (distance / (time / 3600)).toFixed(2); // km/h
    const vma = vmaInput.value ? parseFloat(vmaInput.value) : "N/A";

    // Données à encoder dans le QR code
    const data = {
      eleve1: eleve1Input.value.trim(),
      eleve2: eleve2Input.value.trim(),
      classe: classeInput.value.trim(),
      duree: formatTime(time),
      dureeSec: time,
      distance: distance,
      tours: laps,
      vitesse: vitesse,
      vma: vma,
      etat: etat,
      timestamp: new Date().toISOString()
    };

    const text = JSON.stringify(data);

    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: text,
      width: 220,
      height: 220
    });

    qrContainer.style.display = "block";
  });
});

// --- Partie Prof: Login ---

pinSubmit.addEventListener("click", () => {
  if (pinInput.value === "7890") {
    profAccess.style.display = "none";
    profDashboard.style.display = "block";
  } else {
    alert("Code PIN incorrect.");
  }
});

// --- Scanner QR code (utilise une lib QR code comme html5-qrcode) ---

startScanBtn.addEventListener("click", () => {
  // Initialiser et démarrer le scanner vidéo
  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-scan-container");
  }
  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeSuccessCallback,
    qrCodeErrorCallback
  );
  startScanBtn.disabled = true;
  stopScanBtn.disabled = false;
});

stopScanBtn.addEventListener("click", () => {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      startScanBtn.disabled = false;
      stopScanBtn.disabled = true;
    });
  }
});

// --- Callback QR code ---

function qrCodeSuccessCallback(decodedText, decodedResult) {
  // Eviter doublons
  if (!scannedData.find(item => item.timestamp === JSON.parse(decodedText).timestamp)) {
    try {
      const obj = JSON.parse(decodedText);
      scannedData.push(obj);
      addDataToTable(obj);
    } catch (e) {
      alert("QR code invalide");
    }
  }
}

function qrCodeErrorCallback(errorMessage) {
  // Optionnel: console.log(errorMessage);
}

// --- Ajouter une ligne au tableau ---

function addDataToTable(data) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${data.eleve1}</td>
    <td>${data.eleve2}</td>
    <td>${data.classe}</td>
    <td>${data.duree}</td>
    <td>${data.distance}</td>
    <td>${data.vitesse}</td>
    <td>${data.vma}</td>
    <td>${data.etat}</td>
  `;
  dataTableBody.appendChild(tr);
}

// --- Génération des groupes (groupes de 4 mixte) ---

generateGroupsBtn.addEventListener("click", () => {
  if (scannedData.length < 2) {
    alert("Vous devez scanner au moins 2 binômes pour créer des groupes.");
    return;
  }

  // TODO: Implémenter le tri et la formation des groupes selon VMA et mixité
  // Pour l'instant on affiche les binômes triés par VMA décroissante

  // Filtrer données valides (VMA présent)
  const dataWithVMA = scannedData.filter(d => d.vma !== "N/A" && !isNaN(d.vma));

  // Trier par VMA décroissante
  dataWithVMA.sort((a, b) => b.vma - a.vma);

  // Affichage simple des groupes (à adapter)
  let html = "<h3>Groupes (triés par VMA)</h3><ol>";
  dataWithVMA.forEach((item, index) => {
    html += `<li>${item.eleve1} & ${item.eleve2} (Classe: ${item.classe}) - VMA: ${item.vma}</li>`;
  });
  html += "</ol>";

  groupsDisplay.innerHTML = html;
});

// --- Initial setup ---

lapBtn.disabled = true;
resetBtn.disabled = true;
stopScanBtn.disabled = true;
profDashboard.style.display = "none";
qrContainer.style.display = "none";
etatForme.style.display = "none";
groupsDisplay.innerHTML = "";
