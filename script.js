// === Variables générales ===
let laps = 0;
let chronoInterval, countdownTime, countdownTimer;
let qrDataArray = [];
let course1Done = false;
let eleve1 = {}, eleve2 = {};
let distanceTotal = 0;

// === Chronomètre ===
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const chronoDisplay = document.getElementById('chronoDisplay');
const lapsCount = document.getElementById('lapsCount');

startBtn.addEventListener('click', () => {
  const duree = parseFloat(document.getElementById('duree').value);
  const distanceTour = parseFloat(document.getElementById('distanceTour').value);

  if (!duree || !distanceTour) {
    alert("Veuillez remplir la durée et la distance d’un tour.");
    return;
  }

  countdownTime = duree * 60;
  distanceTotal = 0;
  laps = 0;
  lapsCount.textContent = '0';
  updateStats();

  startCountdown();
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  startBtn.disabled = true;
});

lapBtn.addEventListener('click', () => {
  const distanceTour = parseFloat(document.getElementById('distanceTour').value);
  laps++;
  distanceTotal = laps * distanceTour;
  lapsCount.textContent = laps;
  updateStats();
});

resetBtn.addEventListener('click', () => {
  clearInterval(countdownTimer);
  chronoDisplay.textContent = "00:00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  distanceTotal = 0;
  laps = 0;
  lapsCount.textContent = '0';
  updateStats();
});

function startCountdown() {
  countdownTimer = setInterval(() => {
    if (countdownTime <= 0) {
      clearInterval(countdownTimer);
      showEtatForme();
      return;
    }

    countdownTime--;

    let min = String(Math.floor(countdownTime / 60)).padStart(2, '0');
    let sec = String(countdownTime % 60).padStart(2, '0');
    chronoDisplay.textContent = `${min}:${sec}`;

    if (countdownTime <= 10) {
      chronoDisplay.style.color = 'red';
    } else {
      chronoDisplay.style.color = 'black';
    }

    updateStats();
  }, 1000);
}

// === Mise à jour des stats ===
function updateStats() {
  const duree = parseFloat(document.getElementById('duree').value);
  const tempsHeure = duree / 60;
  const distanceKm = distanceTotal / 1000;
  const vitesseMoy = (distanceKm / tempsHeure).toFixed(2);
  const vma = (distanceKm / (tempsHeure * 0.92)).toFixed(2);

  document.getElementById('distanceTotal').textContent = distanceTotal;
  document.getElementById('distanceKm').textContent = distanceKm.toFixed(2);
  document.getElementById('vitesseMoy').textContent = vitesseMoy;
  document.getElementById('vmaReal').textContent = vma;
}

// === Ressenti ===
const etatButtons = document.querySelectorAll('.etatBtn');
etatButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;

    const distanceKm = (distanceTotal / 1000).toFixed(2);
    const duree = parseFloat(document.getElementById('duree').value);
    const vitesse = (distanceKm / (duree / 60)).toFixed(2);
    const vma = (distanceKm / ((duree / 60) * 0.92)).toFixed(2);

    const vmaRef = parseFloat(document.getElementById('vmaRef').value);
    const infos = {
      nom: course1Done ? document.getElementById('nom2').value : document.getElementById('nom1').value,
      prenom: course1Done ? document.getElementById('prenom2').value : document.getElementById('prenom1').value,
      classe: course1Done ? document.getElementById('classe2').value : document.getElementById('classe1').value,
      duree,
      distance: distanceTotal,
      vitesse,
      vma,
      etat,
      vmaRef: isNaN(vmaRef) ? '' : vmaRef
    };

    if (!course1Done) {
      eleve1 = infos;
      resetBtn.click();
      course1Done = true;
    } else {
      eleve2 = infos;
      generateQRCode([eleve1, eleve2]);
      document.getElementById('etatForme').style.display = "none";
    }
  });
});

function showEtatForme() {
  document.getElementById('etatForme').style.display = "block";
}

// === QR Code ===
function generateQRCode(data) {
  const container = document.getElementById("qrCodeBox");
  container.innerHTML = "";
  document.getElementById('qrContainer').style.display = "block";
  new QRCode(container, {
    text: JSON.stringify(data),
    width: 200,
    height: 200
  });
}

// === Espace Prof ===
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

// === QR Scan Prof ===
function startQrScanner() {
  const qrReader = new Html5Qrcode("qr-reader");

  qrReader.start({ facingMode: "environment" }, {
    fps: 10,
    qrbox: 250
  }, (decoded) => {
    try {
      const data = JSON.parse(decoded);
      data.forEach(entry => qrDataArray.push(entry));
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

// === Mise à jour du tableau ===
function updateTable() {
  const body = document.getElementById("resultsBody");
  body.innerHTML = "";
  qrDataArray.forEach((data, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>-</td>
      <td>${data.nom}</td>
      <td>${data.prenom}</td>
      <td>${data.classe}</td>
      <td>${data.duree}</td>
      <td>${data.distance}</td>
      <td>${data.vitesse}</td>
      <td>${data.vma}</td>
      <td>${data.etat}</td>
    `;
    body.appendChild(row);
  });
}

// === Export CSV ===
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  let csv = "Nom,Prénom,Classe,Durée,Distance,Vitesse,VMA,État\n";
  qrDataArray.forEach(d => {
    csv += `${d.nom},${d.prenom},${d.classe},${d.duree},${d.distance},${d.vitesse},${d.vma},${d.etat}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_runstats.csv";
  a.click();
  URL.revokeObjectURL(url);
});
