let chronoInterval;
let seconds = 0;
let isRunning = false;
let laps = 0;
let currentRunner = 1;
let runnersData = [];
let qrCode;

function updateChronoDisplay() {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  document.getElementById("chronoDisplay").textContent =
    `${minutes.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function startChrono() {
  const duree = parseFloat(document.getElementById("duree").value) * 60;
  if (isNaN(duree) || duree <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }

  isRunning = true;
  document.getElementById("startBtn").disabled = true;
  document.getElementById("lapBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;

  chronoInterval = setInterval(() => {
    seconds++;
    updateChronoDisplay();

    const distanceTour = parseFloat(document.getElementById("distanceTour").value);
    const distanceTotale = distanceTour * laps;
    const vitesse = (distanceTotale / 1000) / (seconds / 3600);
    const vma = (vitesse * 1.15).toFixed(2);

    document.getElementById("distanceTotal").textContent = distanceTotale.toFixed(0);
    document.getElementById("distanceKm").textContent = (distanceTotale / 1000).toFixed(2);
    document.getElementById("vitesseMoy").textContent = vitesse.toFixed(2);
    document.getElementById("vmaReal").textContent = vma;

    const chrono = document.getElementById("chronoDisplay");
    const ratio = seconds / duree;
    if (ratio >= 1) {
      stopChrono();
    } else if (ratio >= 0.75) {
      chrono.className = "orange";
    } else if (ratio >= 0.9) {
      chrono.className = "red";
    }
  }, 1000);
}

function stopChrono() {
  clearInterval(chronoInterval);
  isRunning = false;
  document.getElementById("lapBtn").disabled = true;
  document.getElementById("startBtn").disabled = true;
  document.getElementById("resetBtn").disabled = false;
  document.getElementById("etatForme").style.display = "block";
}

function resetChrono() {
  clearInterval(chronoInterval);
  seconds = 0;
  laps = 0;
  isRunning = false;
  updateChronoDisplay();

  document.getElementById("lapsCount").textContent = laps;
  document.getElementById("distanceTotal").textContent = "0";
  document.getElementById("distanceKm").textContent = "0.00";
  document.getElementById("vitesseMoy").textContent = "0.00";
  document.getElementById("vmaReal").textContent = "0.00";

  document.getElementById("startBtn").disabled = false;
  document.getElementById("lapBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;

  document.getElementById("etatForme").style.display = "none";
  document.getElementById("qrContainer").style.display = "none";
  document.getElementById("chronoDisplay").className = "";
}

function calculateStats() {
  const distanceTour = parseFloat(document.getElementById("distanceTour").value);
  const distanceTotale = laps * distanceTour;
  const tempsHeure = seconds / 3600;
  const vitesse = distanceTotale / 1000 / tempsHeure;
  const vmaEstimee = vitesse * 1.15;

  return {
    distanceTotale: Math.round(distanceTotale),
    distanceKm: (distanceTotale / 1000).toFixed(2),
    vitesseMoy: vitesse.toFixed(2),
    vmaEstimee: vmaEstimee.toFixed(2),
  };
}

document.getElementById("startBtn").addEventListener("click", startChrono);

document.getElementById("lapBtn").addEventListener("click", () => {
  if (!isRunning) return;
  laps++;
  document.getElementById("lapsCount").textContent = laps;
});

document.getElementById("resetBtn").addEventListener("click", resetChrono);

document.querySelectorAll(".etatBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const stats = calculateStats();
    const nom = document.getElementById(`nom${currentRunner}`).value.trim();
    const prenom = document.getElementById(`prenom${currentRunner}`).value.trim();
    const classe = document.getElementById(`classe${currentRunner}`).value.trim();

    if (!nom || !prenom || !classe) {
      alert("Veuillez remplir toutes les informations de l'élève.");
      return;
    }

    runnersData.push({
      nom,
      prenom,
      classe,
      distance: stats.distanceTotale,
      vitesse: stats.vitesseMoy,
      vma: stats.vmaEstimee,
      etat: btn.dataset.etat,
    });

    document.getElementById("etatForme").style.display = "none";

    if (currentRunner === 1) {
      currentRunner = 2;
      resetChrono();
    } else {
      currentRunner = 1;
      const qrText = JSON.stringify(runnersData);
      const qrContainer = document.getElementById("qrContainer");
      const qrBox = document.getElementById("qrCodeBox");
      qrBox.innerHTML = "";
      qrContainer.style.display = "block";
      new QRCode(qrBox, {
        text: qrText,
        width: 200,
        height: 200,
      });
      resetChrono();
    }
  });
});

// Prof Access
document.getElementById("profPinSubmit").addEventListener("click", () => {
  const pin = document.getElementById("profPinInput").value;
  if (pin === "1976") {
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("profPinSubmit").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
  } else {
    alert("Code incorrect.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("studentInput").style.display = "block";
  document.getElementById("profDashboard").style.display = "none";
  document.getElementById("profPinSubmit").style.display = "inline-block";
  document.getElementById("logoutBtn").style.display = "none";
});

// QR Code Scanner & Table
const scanner = new Html5Qrcode("qr-reader");
document.getElementById("stopScanBtn").addEventListener("click", () => {
  scanner.stop();
});

scanner.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  (decodedText) => {
    scanner.stop();
    const data = JSON.parse(decodedText);
    const tbody = document.getElementById("resultsBody");
    data.forEach((runner, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>—</td>
        <td>${runner.nom}</td>
        <td>${runner.prenom}</td>
        <td>${runner.classe}</td>
        <td>—</td>
        <td>${runner.distance}</td>
        <td>${runner.vitesse}</td>
        <td>${runner.vma}</td>
        <td>${runner.etat}</td>
      `;
      tbody.appendChild(row);
    });
  },
  (err) => {
    // Ignorer les erreurs de scan
  }
);

document.getElementById("exportCsvBtn").addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("table tr"));
  const csvContent = rows
    .map((row) =>
      Array.from(row.querySelectorAll("td, th"))
        .map((cell) => `"${cell.innerText}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "runstats.csv";
  a.click();
});
