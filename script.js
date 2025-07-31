
// ========== Variables Globales ==========
let chronoInterval, time = 0, laps = 0;
let currentStudent = 1;
let dataStudent1 = {}, dataStudent2 = {};
let scannedResults = [];

// ========== Fonctions Utilitaires ==========
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateStats() {
  const distanceTour = Number(document.getElementById('distanceTour').value);
  const duree = Number(document.getElementById('duree').value) * 60;
  const distance = laps * distanceTour;
  const vitesse = (distance / duree) * 3.6;
  const vma = vitesse * 1.15;

  document.getElementById('distanceTotal').textContent = distance.toFixed(0);
  document.getElementById('distanceKm').textContent = (distance / 1000).toFixed(2);
  document.getElementById('vitesseMoy').textContent = vitesse.toFixed(2);
  document.getElementById('vmaReal').textContent = vma.toFixed(2);
}

function resetChrono() {
  clearInterval(chronoInterval);
  time = 0; laps = 0;
  document.getElementById('chronoDisplay').textContent = "00:00";
  document.getElementById('lapsCount').textContent = laps;
  document.getElementById('startBtn').disabled = false;
  document.getElementById('lapBtn').disabled = true;
  document.getElementById('resetBtn').disabled = true;
  document.getElementById('etatForme').style.display = "none";
  document.getElementById('chronoDisplay').classList.remove("red");
}

// ========== Chronomètre ==========
document.getElementById('startBtn').addEventListener('click', () => {
  const dureeMin = Number(document.getElementById('duree').value);
  if (!dureeMin || !document.getElementById('distanceTour').value) {
    alert("Remplissez la durée et la distance du tour.");
    return;
  }

  chronoInterval = setInterval(() => {
    time++;
    document.getElementById('chronoDisplay').textContent = formatTime(time);
    if (Number(dureeMin) * 60 - time <= 10) {
      document.getElementById('chronoDisplay').classList.add('red');
    }
    if (time >= dureeMin * 60) {
      clearInterval(chronoInterval);
      document.getElementById('lapBtn').disabled = true;
      document.getElementById('etatForme').style.display = "block";
    }
    updateStats();
  }, 1000);

  document.getElementById('startBtn').disabled = true;
  document.getElementById('lapBtn').disabled = false;
  document.getElementById('resetBtn').disabled = false;
});

document.getElementById('lapBtn').addEventListener('click', () => {
  laps++;
  document.getElementById('lapsCount').textContent = laps;
  updateStats();
});

document.getElementById('resetBtn').addEventListener('click', resetChrono);

// ========== État Forme ==========
document.querySelectorAll('.etatBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const distance = Number(document.getElementById('distanceTotal').textContent);
    const vitesse = Number(document.getElementById('vitesseMoy').textContent);
    const vma = Number(document.getElementById('vmaReal').textContent);
    const etat = btn.dataset.etat;

    const nom = document.getElementById(`nom${currentStudent}`).value;
    const prenom = document.getElementById(`prenom${currentStudent}`).value;
    const classe = document.getElementById(`classe${currentStudent}`).value;
    const duree = Number(document.getElementById('duree').value);

    const record = { nom, prenom, classe, duree, distance, vitesse, vma, etat };

    if (currentStudent === 1) {
      dataStudent1 = record;
      currentStudent = 2;
      resetChrono();
      alert("À l'élève 2 !");
    } else {
      dataStudent2 = record;
      const allData = [dataStudent1, dataStudent2];
      const qrData = JSON.stringify(allData);
      document.getElementById("qrCodeBox").innerHTML = "";
      new QRCode(document.getElementById("qrCodeBox"), {
        text: qrData,
        width: 200,
        height: 200
      });
      document.getElementById("qrContainer").style.display = "block";
      resetChrono();
    }

    document.getElementById('etatForme').style.display = "none";
  });
});

// ========== Accès Professeur ==========
document.getElementById("profPinSubmit").addEventListener("click", () => {
  const code = document.getElementById("profPinInput").value;
  if (code === "1976") {
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("logoutBtn").style.display = "inline-block";
    startScanner();
  } else {
    alert("Code incorrect.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("studentInput").style.display = "block";
  document.getElementById("profDashboard").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
  stopScanner();
});

// ========== Scanner QR ==========
let html5QrCode;

function startScanner() {
  html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start({ facingMode: "environment" }, {
    fps: 10,
    qrbox: 250
  }, (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      data.forEach(entry => {
        scannedResults.push(entry);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td></td>
          <td>${entry.nom}</td>
          <td>${entry.prenom}</td>
          <td>${entry.classe}</td>
          <td>${entry.duree}</td>
          <td>${entry.distance}</td>
          <td>${entry.vitesse.toFixed(2)}</td>
          <td>${entry.vma.toFixed(2)}</td>
          <td>${entry.etat}</td>
        `;
        document.getElementById("resultsBody").appendChild(row);
      });
    } catch (e) {
      console.error("QR invalide");
    }
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop();
    html5QrCode.clear();
  }
}

// ========== Export CSV ==========
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  const header = ["Groupe", "Nom", "Prénom", "Classe", "Durée", "Distance", "Vitesse", "VMA", "État"];
  const rows = [header];

  scannedResults.forEach((d, i) => {
    rows.push(["", d.nom, d.prenom, d.classe, d.duree, d.distance, d.vitesse.toFixed(2), d.vma.toFixed(2), d.etat]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "RunStats_Resultats.csv");
  link.click();
});
