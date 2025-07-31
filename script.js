let chronoInterval, remainingTime, totalLaps = 0;
let qrCode;
let currentRunner = 1;
let runnersData = [];
let scannedData = [];
const pinProf = "1976";

// Chrono
function updateChronoDisplay(seconds) {
  const chronoDisplay = document.getElementById("chronoDisplay");
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  chronoDisplay.textContent = `${min}:${sec}`;

  // Couleur
  if (seconds <= 10) {
    chronoDisplay.classList.add("red");
    chronoDisplay.classList.remove("orange");
  } else if (seconds <= 30) {
    chronoDisplay.classList.add("orange");
    chronoDisplay.classList.remove("red");
  } else {
    chronoDisplay.classList.remove("red", "orange");
  }
}

function resetChrono() {
  clearInterval(chronoInterval);
  document.getElementById("chronoDisplay").textContent = "00:00";
  document.getElementById("startBtn").disabled = false;
  document.getElementById("lapBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  totalLaps = 0;
  document.getElementById("lapsCount").textContent = "0";
  document.getElementById("distanceTotal").textContent = "0";
  document.getElementById("distanceKm").textContent = "0.00";
  document.getElementById("vitesseMoy").textContent = "0.00";
  document.getElementById("vmaReal").textContent = "0.00";
}

function calculateStats() {
  const distanceTour = parseFloat(document.getElementById("distanceTour").value);
  const vmaRef = parseFloat(document.getElementById("vmaRef").value) || 0;
  const duree = parseFloat(document.getElementById("duree").value);
  const distanceTotale = totalLaps * distanceTour;
  const distanceKm = distanceTotale / 1000;
  const vitesseMoy = distanceKm / (duree / 60);
  const vmaEstimee = vitesseMoy;

  document.getElementById("distanceTotal").textContent = distanceTotale.toFixed(0);
  document.getElementById("distanceKm").textContent = distanceKm.toFixed(2);
  document.getElementById("vitesseMoy").textContent = vitesseMoy.toFixed(2);
  document.getElementById("vmaReal").textContent = vmaEstimee.toFixed(2);

  return { distanceTotale, vitesseMoy, vmaEstimee };
}

// Chrono Start
document.getElementById("startBtn").addEventListener("click", () => {
  const duree = parseFloat(document.getElementById("duree").value);
  if (!duree || duree <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }

  remainingTime = Math.floor(duree * 60);
  updateChronoDisplay(remainingTime);
  document.getElementById("startBtn").disabled = true;
  document.getElementById("lapBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;

  chronoInterval = setInterval(() => {
    remainingTime--;
    updateChronoDisplay(remainingTime);
    calculateStats();
    if (remainingTime <= 0) {
      clearInterval(chronoInterval);
      document.getElementById("lapBtn").disabled = true;
      document.getElementById("etatForme").style.display = "block";
    }
  }, 1000);
});

document.getElementById("lapBtn").addEventListener("click", () => {
  totalLaps++;
  document.getElementById("lapsCount").textContent = totalLaps;
  calculateStats();
});

document.getElementById("resetBtn").addEventListener("click", resetChrono);

// Ressenti
document.querySelectorAll(".etatBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const stats = calculateStats();
    const nom = document.getElementById(`nom${currentRunner}`).value;
    const prenom = document.getElementById(`prenom${currentRunner}`).value;
    const classe = document.getElementById(`classe${currentRunner}`).value;

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
    document.getElementById("qrContainer").style.display = "none";

    if (currentRunner === 1) {
      currentRunner = 2;
      resetChrono();
    } else {
      currentRunner = 1;
      // Générer QR code après les 2 élèves
      const qrText = JSON.stringify(runnersData);
      document.getElementById("qrContainer").style.display = "block";
      document.getElementById("qrCodeBox").innerHTML = "";
      qrCode = new QRCode(document.getElementById("qrCodeBox"), {
        text: qrText,
        width: 200,
        height: 200,
      });
      runnersData = [];
      resetChrono();
    }
  });
});

// Accès Prof
document.getElementById("profPinSubmit").addEventListener("click", () => {
  const pin = document.getElementById("profPinInput").value;
  if (pin === pinProf) {
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("logoutBtn").style.display = "inline-block";
  } else {
    alert("Code incorrect.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("studentInput").style.display = "block";
  document.getElementById("profDashboard").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
});

// QR Scan
let html5QrCode;
document.getElementById("stopScanBtn").addEventListener("click", () => {
  if (html5QrCode) html5QrCode.stop();
});

function updateTable() {
  const tbody = document.getElementById("resultsBody");
  tbody.innerHTML = "";
  scannedData.forEach((runner, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${Math.floor(i / 4) + 1}</td>
      <td>${runner.nom}</td>
      <td>${runner.prenom}</td>
      <td>${runner.classe}</td>
      <td>${runner.duree || ""}</td>
      <td>${runner.distance}</td>
      <td>${runner.vitesse.toFixed(2)}</td>
      <td>${runner.vma.toFixed(2)}</td>
      <td>${runner.etat}</td>
    `;
    tbody.appendChild(row);
  });
}

function startQRScanner() {
  html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
    },
    (decodedText) => {
      try {
        const runners = JSON.parse(decodedText);
        scannedData.push(...runners);
        updateTable();
      } catch (e) {
        alert("QR code invalide.");
      }
    },
    (err) => {}
  );
}

startQRScanner();

// Export CSV
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  let csv = "Groupe;Nom;Prénom;Classe;Durée;Distance;Vitesse;VMA;État\n";
  scannedData.forEach((runner, i) => {
    csv += `${Math.floor(i / 4) + 1};${runner.nom};${runner.prenom};${runner.classe};${runner.duree || ""};${runner.distance};${runner.vitesse.toFixed(2)};${runner.vma.toFixed(2)};${runner.etat}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "resultats_RunStats.csv");
  a.click();
});

// Génération des groupes mixtes
document.getElementById("generateGroupsBtn").addEventListener("click", () => {
  const sorted = [...scannedData].sort((a, b) => b.vma - a.vma);
  const groups = [];
  while (sorted.length >= 4) {
    const group = [
      sorted.shift(), // plus fort
      sorted.pop(),   // plus faible
      sorted.shift(), // intermédiaire
      sorted.pop()    // autre intermédiaire
    ];
    groups.push(group);
  }

  const display = document.getElementById("groupsDisplay");
  display.innerHTML = "";
  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Groupe ${i + 1}</h3><ul>` + group.map(r => `<li>${r.prenom} ${r.nom} (${r.classe}) - VMA: ${r.vma.toFixed(2)}</li>`).join("") + "</ul>";
    display.appendChild(div);
  });
});
