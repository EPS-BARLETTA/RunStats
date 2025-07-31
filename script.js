// =========================
// Variables globales
// =========================
let tours = [];
let tempsTotal = 0;
let chronoActif = false;
let interval;
let currentRunner = 1; // 1 = élève 1, 2 = élève 2
let runnersData = {};
let qrDataArray = []; // Pour stocker les données scannées (mode prof)

// =========================
// Chronomètre
// =========================
const chronoDisplay = document.getElementById("chronoDisplay");
const btnStart = document.getElementById("startBtn");
const btnLap = document.getElementById("lapBtn");
const btnReset = document.getElementById("resetBtn");

btnStart.addEventListener("click", startChrono);
btnLap.addEventListener("click", addLap);
btnReset.addEventListener("click", resetChrono);

function startChrono() {
  if (chronoActif) return;
  chronoActif = true;
  interval = setInterval(() => {
    tempsTotal++;
    afficherTemps();
  }, 1000);
}

function addLap() {
  const distanceTour = parseFloat(document.getElementById("distanceTour").value);
  if (!distanceTour) {
    alert("Indiquez la distance d'un tour !");
    return;
  }
  tours.push(distanceTour);
  updateStats();
}

function resetChrono() {
  clearInterval(interval);
  chronoActif = false;
  tempsTotal = 0;
  tours = [];
  afficherTemps();
  updateStats();
}

function afficherTemps() {
  let min = String(Math.floor(tempsTotal / 60)).padStart(2, "0");
  let sec = String(tempsTotal % 60).padStart(2, "0");
  chronoDisplay.textContent = `${min}:${sec}`;
}

// =========================
// Calcul des stats
// =========================
function calculStats() {
  let totalDistance = tours.reduce((a, b) => a + b, 0);
  let dureeMinutes = tempsTotal / 60;
  let vitesseMoyenne = dureeMinutes > 0 ? (totalDistance / 1000) / dureeMinutes : 0;
  let vmaEstime = vitesseMoyenne / 0.92;

  return {
    totalDistance: totalDistance.toFixed(0),
    vitesseMoyenne: vitesseMoyenne.toFixed(2),
    vmaEstime: vmaEstime.toFixed(2)
  };
}

function updateStats() {
  let stats = calculStats();
  document.getElementById("distanceTotal").textContent = stats.totalDistance;
  document.getElementById("vitesseMoy").textContent = stats.vitesseMoyenne;
  document.getElementById("vmaEstime").textContent = stats.vmaEstime;
}

// =========================
// Boutons Emoji (fin course)
// =========================
document.querySelectorAll('.etatBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    let stats = calculStats();
    runnersData[currentRunner] = {
      nom: document.getElementById(`nom${currentRunner}`).value,
      sexe: document.getElementById(`sexe${currentRunner}`).value,
      totalDistance: stats.totalDistance,
      vitesseMoyenne: stats.vitesseMoyenne,
      vmaEstime: stats.vmaEstime,
      emoji: btn.textContent
    };

    if (!runnersData[currentRunner].nom || !stats.totalDistance) {
      alert("Remplis le nom et la distance avant de valider !");
      return;
    }

    if (currentRunner === 1) {
      // Passage au deuxième coureur
      currentRunner = 2;
      tours = [];
      btnReset.click();
      alert("Deuxième coureur, préparez-vous !");
    } else {
      // Les deux coureurs ont terminé
      afficherQRCode();
      alert("QR Code généré !");
    }
  });
});

// =========================
// Génération QR Code
// =========================
function afficherQRCode() {
  const container = document.getElementById("qrCodeBox");
  container.innerHTML = "";
  document.getElementById('qrContainer').style.display = "block";
  new QRCode(container, {
    text: JSON.stringify(runnersData),
    width: 200,
    height: 200
  });
}

// =========================
// Mode Prof : Accès sécurisé
// =========================
document.getElementById("profPinSubmit").addEventListener("click", () => {
  const code = document.getElementById("profPinInput").value;
  if (code === "1976") {
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    startQrScanner();
  } else {
    alert("Code incorrect.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  location.reload();
});

// =========================
// Scanner QR Code (mode prof)
// =========================
function startQrScanner() {
  const qrReader = new Html5Qrcode("qr-reader");

  qrReader.start({ facingMode: "environment" }, {
    fps: 10,
    qrbox: 250
  }, (decoded) => {
    try {
      const data = JSON.parse(decoded);
      // data = { 1: {...}, 2: {...} }
      qrDataArray.push(data[1]);
      qrDataArray.push(data[2]);
      updateTable();
    } catch (e) {
      console.error("QR non lisible");
    }
  });

  document.getElementById("stopScanBtn").addEventListener("click", () => {
    qrReader.stop().then(() => {
      document.getElementById("qr-reader").innerHTML = "";
    });
  });
}

// =========================
// Mise à jour tableau résultats
// =========================
function updateTable() {
  const body = document.getElementById("resultsBody");
  body.innerHTML = "";
  qrDataArray.forEach((data) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.nom}</td>
      <td>${data.sexe}</td>
      <td>${data.totalDistance}</td>
      <td>${data.vitesseMoyenne}</td>
      <td>${data.vmaEstime}</td>
      <td>${data.emoji}</td>
    `;
    body.appendChild(row);
  });
}

// =========================
// Tri par VMA + Groupes mixtes
// =========================
document.getElementById("triBtn").addEventListener("click", () => {
  // 1. Trier par VMA (descendant)
  let sorted = [...qrDataArray].sort((a, b) => b.vmaEstime - a.vmaEstime);

  // 2. Former groupes de 4 : 1 haut, 2 moyens, 1 bas
  let groupes = [];
  while (sorted.length >= 4) {
    let haut = sorted.shift();
    let moyens = sorted.splice(0, 2);
    let bas = sorted.pop();
    groupes.push([haut, ...moyens, bas]);
  }

  // 3. Affichage groupes
  const body = document.getElementById("resultsBody");
  body.innerHTML = "";
  groupes.forEach((grp, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">Groupe ${idx + 1} : ${grp.map(e => e.nom + " (" + e.sexe + ")").join(", ")}</td>`;
    body.appendChild(row);
  });
});
