// Variables globales
let laps1 = 0, laps2 = 0;
let distanceTour = 0;
let vmaRef = 0;
let dureeCourse = 0;

let chronoInterval = null;
let chronoStartTime = null;

let etatForme1 = null;
let etatForme2 = null;

let currentEleve = 1; // 1 ou 2 : qui court, qui observe

// Elements DOM
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const distanceTotalEl = document.getElementById("distanceTotal");
const distanceKmEl = document.getElementById("distanceKm");
const vitesseMoyEl = document.getElementById("vitesseMoy");
const vmaRealEl = document.getElementById("vmaReal");
const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");
const etatFormeSection = document.getElementById("etatForme");
const etatButtons = document.querySelectorAll("#etatForme button.etatBtn");

// Fonction démarrage chrono
function startChrono() {
  laps1 = 0;
  laps2 = 0;
  distanceTour = parseFloat(document.getElementById("distanceTour").value);
  vmaRef = parseFloat(document.getElementById("vmaRef").value) || 0;
  dureeCourse = parseFloat(document.getElementById("duree").value);

  if (!distanceTour || !dureeCourse) {
    alert("Veuillez saisir la durée et la distance par tour.");
    return;
  }

  chronoStartTime = Date.now();
  chronoInterval = setInterval(updateChrono, 1000);

  document.getElementById("startBtn").disabled = true;
  document.getElementById("lapBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;

  etatFormeSection.style.display = "none";
  qrContainer.style.display = "none";

  updateStats(0, 0);
}

// Fonction mise à jour chrono et stats temps réel
function updateChrono() {
  const elapsedMs = Date.now() - chronoStartTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const totalSec = dureeCourse * 60;

  // Format mm:ss
  const m = Math.floor(elapsedSec / 60).toString().padStart(2, "0");
  const s = (elapsedSec % 60).toString().padStart(2, "0");
  chronoDisplay.textContent = `${m}:${s}`;

  // Fin chrono
  if (elapsedSec >= totalSec) {
    clearInterval(chronoInterval);
    document.getElementById("lapBtn").disabled = true;
    etatFormeSection.style.display = "block"; // Affiche les boutons "Comment tu te sens"
    return;
  }

  // Calcule distance + vitesse moyenne en fonction du coureur actif
  const laps = currentEleve === 1 ? laps1 : laps2;
  const distance = laps * distanceTour; // en mètres
  const vitesseKmH = (distance / 1000) / (elapsedSec / 3600); // km/h

  updateStats(distance, vitesseKmH);
}

// Mise à jour stats affichées
function updateStats(distance, vitesseKmH) {
  distanceTotalEl.textContent = distance.toFixed(0);
  distanceKmEl.textContent = (distance / 1000).toFixed(2);
  vitesseMoyEl.textContent = vitesseKmH.toFixed(2);

  // VMA estimée = vitesse moyenne * 1.15 (exemple)
  const vmaEstimee = vitesseKmH * 1.15;
  vmaRealEl.textContent = vmaEstimee.toFixed(2);

  // Ajout couleur selon vitesse (vert bon, orange moyen, rouge lent)
  if (vitesseKmH > 12) {
    vitesseMoyEl.style.color = "green";
  } else if (vitesseKmH > 8) {
    vitesseMoyEl.style.color = "orange";
  } else {
    vitesseMoyEl.style.color = "red";
  }
}

// Ajouter un tour
function addLap() {
  if (currentEleve === 1) {
    laps1++;
  } else {
    laps2++;
  }
  lapsCount.textContent = (currentEleve === 1 ? laps1 : laps2);

  // Update stats tout de suite
  const elapsedSec = Math.floor((Date.now() - chronoStartTime) / 1000);
  const distance = (currentEleve === 1 ? laps1 : laps2) * distanceTour;
  const vitesseKmH = (distance / 1000) / (elapsedSec / 3600);
  updateStats(distance, vitesseKmH);
}

// Reset complet
function reset() {
  clearInterval(chronoInterval);
  chronoDisplay.textContent = "00:00";
  laps1 = 0;
  laps2 = 0;
  lapsCount.textContent = "0";
  updateStats(0, 0);
  document.getElementById("startBtn").disabled = false;
  document.getElementById("lapBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  etatFormeSection.style.display = "none";
  qrContainer.style.display = "none";
  currentEleve = 1;
  etatForme1 = null;
  etatForme2 = null;
}

// Quand on clique sur un état de forme (ressenti)
etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentEleve === 1) {
      etatForme1 = btn.getAttribute("data-etat");
      alert(`Élève 1 : ${etatForme1}`);

      // Switch pour élève 2
      currentEleve = 2;
      lapsCount.textContent = laps2;
      resetForSecondEleve();

    } else {
      etatForme2 = btn.getAttribute("data-etat");
      alert(`Élève 2 : ${etatForme2}`);

      // Après le second ressenti, on génère le QR code avec les 2 élèves
      generateQrCode();
    }
  });
});

// Préparation pour le second élève : reset chrono mais conserve les infos saisies
function resetForSecondEleve() {
  clearInterval(chronoInterval);
  chronoDisplay.textContent = "00:00";
  lapsCount.textContent = laps2;
  updateStats(0, 0);

  document.getElementById("startBtn").disabled = false;
  document.getElementById("lapBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;

  etatFormeSection.style.display = "none";
  qrContainer.style.display = "none";
}

// Générer le QR code contenant les 2 élèves et leurs données
function generateQrCode() {
  const eleve1 = {
    nom: document.getElementById("nom1").value.trim(),
    prenom: document.getElementById("prenom1").value.trim(),
    classe: document.getElementById("classe1").value.trim(),
    laps: laps1,
    distance: laps1 * distanceTour,
    vitesse: (laps1 * distanceTour) / (dureeCourse * 60) * 3.6, // m/s to km/h
    vma: vmaRef || 0,
    etat: etatForme1 || "Non renseigné",
  };

  const eleve2 = {
    nom: document.getElementById("nom2").value.trim(),
    prenom: document.getElementById("prenom2").value.trim(),
    classe: document.getElementById("classe2").value.trim(),
    laps: laps2,
    distance: laps2 * distanceTour,
    vitesse: (laps2 * distanceTour) / (dureeCourse * 60) * 3.6,
    vma: vmaRef || 0,
    etat: etatForme2 || "Non renseigné",
  };

  const data = { eleve1, eleve2 };

  qrContainer.style.display = "block";
  qrCodeBox.innerHTML = "";
  new QRCode(qrCodeBox, {
    text: JSON.stringify(data),
    width: 220,
    height: 220,
  });
}

// --- Événements boutons ---
document.getElementById("startBtn").addEventListener("click", startChrono);
document.getElementById("lapBtn").addEventListener("click", addLap);
document.getElementById("resetBtn").addEventListener("click", reset);

// === SCAN côté Professeur (partie simplifiée) ===
function onScanSuccess(decodedText) {
  try {
    const data = JSON.parse(decodedText);
    console.log("Données reçues via QR :", data);

    // Ajouter les 2 élèves au tableau des résultats
    addEleveToTable(data.eleve1, "A");
    addEleveToTable(data.eleve2, "A");
  } catch (e) {
    console.error("QR Code invalide:", e);
  }
}

// Exemple fonction d'ajout au tableau (à adapter selon ta structure)
function addEleveToTable(eleve, groupe) {
  const tbody = document.getElementById("resultsBody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${groupe}</td>
    <td>${eleve.nom}</td>
    <td>${eleve.prenom}</td>
    <td>${eleve.classe}</td>
    <td>${dureeCourse} min</td>
    <td>${eleve.distance.toFixed(0)}</td>
    <td>${eleve.vitesse.toFixed(2)}</td>
    <td>${eleve.vma.toFixed(2)}</td>
    <td>${eleve.etat}</td>
  `;
  tbody.appendChild(tr);
}

// Initialisation du scanner QR côté prof
const html5QrCode = new Html5Qrcode("qr-reader");

document.getElementById("profPinSubmit").addEventListener("click", () => {
  const pin = document.getElementById("profPinInput").value;
  if (pin === "1976") {
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("profAccess").style.display = "none";

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess
    ).catch(err => console.error("Erreur démarrage scan QR", err));
  } else {
    alert("Code Prof incorrect");
  }
});

document.getElementById("stopScanBtn").addEventListener("click", () => {
  html5QrCode.stop().then(() => {
    console.log("Scan arrêté");
  }).catch(err => console.error(err));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("profDashboard").style.display = "none";
  document.getElementById("studentInput").style.display = "block";
  document.getElementById("profAccess").style.display = "block";
  document.getElementById("profPinInput").value = "";
  html5QrCode.stop();
});
