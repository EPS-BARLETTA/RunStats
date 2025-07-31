// script.js

// --- Variables DOM ---
const nom1 = document.getElementById("nom1");
const prenom1 = document.getElementById("prenom1");
const classe1 = document.getElementById("classe1");
const vmaRef1 = document.getElementById("vmaRef1");

const nom2 = document.getElementById("nom2");
const prenom2 = document.getElementById("prenom2");
const classe2 = document.getElementById("classe2");
const vmaRef2 = document.getElementById("vmaRef2");

const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");

const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");

const etatForme = document.getElementById("etatForme");
const etatBtns = document.querySelectorAll(".etatBtn");

const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

const profAccess = document.getElementById("profAccess");
const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const changePinBtn = document.getElementById("changePinBtn");

const profDashboard = document.getElementById("profDashboard");
const qrReaderContainer = document.getElementById("qr-scan-container");
const qrReaderDiv = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const resultsBody = document.getElementById("resultsBody");

const generateGroupsBtn = document.getElementById("generateGroupsBtn");
const groupsDisplay = document.getElementById("groupsDisplay");

// --- Variables de fonctionnement ---
let timer;
let time = 0;
let laps = 0;
let etat = "";

let dureeSec = 0;
let distanceTour = 0;

let scanActive = false;
let scannedData = [];

const profPin = "7890";

// --- Fonctions utilitaires ---
function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function calculateVitesseKmH(distanceM, timeS) {
  if (timeS === 0) return 0;
  return (distanceM / 1000) / (timeS / 3600);
}

function updateDisplay() {
  chronoDisplay.textContent = formatTime(time);
  lapsCount.textContent = laps;
  // Couleur chrono
  if (dureeSec - time <= 10 && time < dureeSec) {
    chronoDisplay.classList.remove("red");
    chronoDisplay.classList.add("orange");
  } else if (time >= dureeSec) {
    chronoDisplay.classList.remove("orange");
    chronoDisplay.classList.add("red");
  } else {
    chronoDisplay.classList.remove("orange", "red");
  }
}

// --- Chrono et gestion course ---
startBtn.addEventListener("click", () => {
  // Validation saisie
  if (
    !nom1.value.trim() || !prenom1.value.trim() || !classe1.value.trim() ||
    !nom2.value.trim() || !prenom2.value.trim() || !classe2.value.trim()
  ) {
    alert("Veuillez remplir toutes les informations des deux élèves.");
    return;
  }
  if (!dureeInput.value || dureeInput.value <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }
  if (!distanceTourInput.value || distanceTourInput.value <= 0) {
    alert("Veuillez saisir une distance de tour valide.");
    return;
  }
  dureeSec = Math.round(parseFloat(dureeInput.value) * 60);
  distanceTour = parseFloat(distanceTourInput.value);

  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";

  time = 0;
  laps = 0;
  etat = "";
  updateDisplay();

  timer = setInterval(() => {
    time++;
    updateDisplay();

    if (time >= dureeSec) {
      clearInterval(timer);
      lapBtn.disabled = true;
      etatForme.style.display = "block";
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
  chronoDisplay.classList.remove("orange", "red");

  updateDisplay();

  // Clear inputs? Non, on conserve pour la saisie continue
});

// --- État de forme ---
etatBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    etat = btn.dataset.etat;
    etatForme.style.display = "none";

    // Calcul distance totale (tours x distanceTour)
    const distTotalM = laps * distanceTour;
    const vitesseMoy = calculateVitesseKmH(distTotalM, time);
    const vma1 = parseFloat(vmaRef1.value) || 0;
    const vma2 = parseFloat(vmaRef2.value) || 0;
    // Moyenne VMA des deux (0 si absent)
    let vmaMoy = 0;
    if (vma1 && vma2) vmaMoy = (vma1 + vma2) / 2;
    else if (vma1) vmaMoy = vma1;
    else if (vma2) vmaMoy = vma2;

    // Données pour QR
    const data = {
      eleve1: { nom: nom1.value.trim(), prenom: prenom1.value.trim(), classe: classe1.value.trim(), vma: vma1 },
      eleve2: { nom: nom2.value.trim(), prenom: prenom2.value.trim(), classe: classe2.value.trim(), vma: vma2 },
      duree: formatTime(time),
      tours: laps,
      distanceTotale_m: distTotalM,
      vitesseMoy_kmh: vitesseMoy.toFixed(2),
      vmaMoy: vmaMoy.toFixed(2),
      etat: etat,
      timestamp: new Date().toISOString()
    };

    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: JSON.stringify(data),
      width: 220,
      height: 220,
      colorDark: "#2980b9",
      colorLight: "#ffffff"
    });

    qrContainer.style.display = "block";
  });
});

// --- Mode Professeur ---
profPinSubmit.addEventListener("click", () => {
  if (profPinInput.value === profPin) {
    profAccess.style.display = "none";
    profDashboard.style.display = "block";
    startQRScan();
  } else {
    alert("Code PIN incorrect.");
  }
});

stopScanBtn.addEventListener("click", () => {
  stopQRScan();
});

exportCsvBtn.addEventListener("click", () => {
  exportCSV();
});

generateGroupsBtn.addEventListener("click", () => {
  generateGroups();
});

// --- QR Scanner (html5-qrcode) ---
let html5QrCode;

function startQRScan() {
  if (scanActive) return;
  scanActive = true;
  qrReaderContainer.style.display = "block";
  resultsBody.innerHTML = "";
  scannedData = [];

  html5QrCode = new Html5Qrcode("qr-reader");
  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250
        },
        onScanSuccess,
        onScanFailure
      );
    } else {
      alert("Aucune caméra détectée.");
    }
  }).catch(err => {
    alert("Erreur caméra : " + err);
  });
}

function stopQRScan() {
  if (!scanActive) return;
  scanActive = false;
  qrReaderContainer.style.display = "none";
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
    }).catch(err => {
      console.error("Erreur arrêt scanner:", err);
    });
  }
}

// Callback quand un QR est scanné avec succès
function onScanSuccess(decodedText, decodedResult) {
  try {
    const data = JSON.parse(decodedText);
    // Vérifier si déjà scanné (par nom+prenom eleve1 et eleve2)
    const exists = scannedData.some(item => 
      (item.eleve1.nom === data.eleve1.nom && item.eleve2.nom === data.eleve2.nom)
    );
    if (!exists) {
      scannedData.push(data);
      addResultToTable(data);
    }
  } catch (e) {
    console.warn("QR Code non reconnu:", e);
  }
}

// On scan failure (par exemple lecture ratée)
function onScanFailure(error) {
  // On peut ignorer les erreurs pour ne pas spammer la console
  // console.warn(`Scan error: ${error}`);
}

// Ajouter une ligne dans le tableau des résultats
function addResultToTable(data) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${data.eleve1.nom} ${data.eleve1.prenom}</td>
    <td>${data.eleve1.classe}</td>
    <td>${data.eleve1.vma || "-"}</td>
    <td>${data.eleve2.nom} ${data.eleve2.prenom}</td>
    <td>${data.eleve2.classe}</td>
    <td>${data.eleve2.vma || "-"}</td>
    <td>${data.duree}</td>
    <td>${data.tours}</td>
    <td>${data.distanceTotale_m}</td>
    <td>${data.vitesseMoy_kmh}</td>
    <td>${data.vmaMoy}</td>
    <td>${data.etat}</td>
    <td>${new Date(data.timestamp).toLocaleString()}</td>
  `;
  resultsBody.appendChild(tr);
}

// Exporter toutes les données scannées au format CSV
function exportCSV() {
  if (scannedData.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }
  const headers = ["Élève 1", "Classe 1", "VMA 1", "Élève 2", "Classe 2", "VMA 2", "Durée", "Tours", "Distance (m)", "Vitesse (km/h)", "VMA Moyenne", "État de forme", "Timestamp"];
  const csvRows = [headers.join(",")];

  scannedData.forEach(data => {
    const row = [
      `"${data.eleve1.nom} ${data.eleve1.prenom}"`,
      `"${data.eleve1.classe}"`,
      data.eleve1.vma || "",
      `"${data.eleve2.nom} ${data.eleve2.prenom}"`,
      `"${data.eleve2.classe}"`,
      data.eleve2.vma || "",
      data.duree,
      data.tours,
      data.distanceTotale_m,
      data.vitesseMoy_kmh,
      data.vmaMoy,
      `"${data.etat}"`,
      `"${data.timestamp}"`
    ];
    csvRows.push(row.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "RunStats_donnees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Génération des groupes de 4 (2 binômes) selon règles VMA
function generateGroups() {
  if (scannedData.length === 0) {
    alert("Aucune donnée scannée pour créer les groupes.");
    return;
  }

  // Préparer tableau des binômes avec moyenne VMA
  const binomes = scannedData.map(item => {
    let vma1 = parseFloat(item.eleve1.vma) || 0;
    let vma2 = parseFloat(item.eleve2.vma) || 0;
    let vmaMoy = 0;
    if (vma1 && vma2) vmaMoy = (vma1 + vma2) / 2;
    else if (vma1) vmaMoy = vma1;
    else if (vma2) vmaMoy = vma2;

    return {
      eleve1: item.eleve1,
      eleve2: item.eleve2,
      vmaMoy: vmaMoy,
      data: item
    };
  });

  // Trier binômes par VMA moyenne décroissante
  binomes.sort((a, b) => b.vmaMoy - a.vmaMoy);

  // Regrouper par catégories VMA (exemple seuils)
  const seuils = {
    elevee: 15, // ex seuil haute VMA
    faible: 10  // ex seuil basse VMA
  };

  const binomesElevee = binomes.filter(b => b.vmaMoy >= seuils.elevee);
  const binomesFaible = binomes.filter(b => b.vmaMoy <= seuils.faible);
  const binomesInter = binomes.filter(b => b.vmaMoy > seuils.faible && b.vmaMoy < seuils.elevee);

  const groupes = [];
  const used = new Set();

  // Fonction pour extraire binôme d’une catégorie non utilisé
  function getUnusedBinome(cat) {
    for (let i = 0; i < cat.length; i++) {
      if (!used.has(cat[i])) {
        used.add(cat[i]);
        return cat[i];
      }
    }
    return null;
  }

  // Créer groupes de 4 (2 binômes)
  while (true) {
    const groupe = [];

    // 1 binome elevee
    const elevee = getUnusedBinome(binomesElevee);
    if (!elevee) break;
    groupe.push(elevee);

    // 1 binome faible
    const faible = getUnusedBinome(binomesFaible);
    if (!faible) break;
    groupe.push(faible);

    // 2 binomes intermédiaires
    const inter1 = getUnusedBinome(binomesInter);
    const inter2 = getUnusedBinome(binomesInter);
    if (!inter1 || !inter2) break;
    groupe.push(inter1, inter2);

    groupes.push(groupe);
  }

  // Affichage
  groupsDisplay.innerHTML = "";
  groupes.forEach((grp, idx) => {
    const div = document.createElement("div");
    div.classList.add("group-card");
    div.innerHTML = `<h3>Groupe ${idx + 1}</h3>`;
    grp.forEach((binome, bIdx) => {
      div.innerHTML += `
        <div class="binome">
          <strong>Binôme ${bIdx + 1}</strong><br>
          ${binome.eleve1.prenom} ${binome.eleve1.nom} (VMA: ${binome.eleve1.vma || "N/A"}) &amp; 
          ${binome.eleve2.prenom} ${binome.eleve2.nom} (VMA: ${binome.eleve2.vma || "N/A"})<br>
          Classe: ${binome.eleve1.classe} &amp; ${binome.eleve2.classe}<br>
          VMA Moyenne: ${binome.vmaMoy.toFixed(2)}
        </div>
      `;
    });
    groupsDisplay.appendChild(div);
  });
}
