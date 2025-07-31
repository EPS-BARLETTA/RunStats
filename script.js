let chronoInterval, startTime;
let laps = 0;
let totalDuration = 0;
let data1 = {}, data2 = {}, currentStudent = 1;
let etat1 = null, etat2 = null;
const PIN = "1976";
const scannedData = [];

const dom = (id) => document.getElementById(id);

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function updateStats(distance, timeMin) {
  const distanceKm = distance / 1000;
  const speed = distanceKm / (timeMin / 60);
  return {
    distanceTotal: distance,
    distanceKm: distanceKm.toFixed(2),
    vitesse: speed.toFixed(2),
    vmaEstimee: speed.toFixed(2)
  };
}

function resetChrono() {
  clearInterval(chronoInterval);
  dom("chronoDisplay").textContent = "00:00";
  dom("lapsCount").textContent = "0";
  laps = 0;
  dom("lapBtn").disabled = true;
  dom("resetBtn").disabled = true;
}

function saveStats() {
  const distanceTour = parseFloat(dom("distanceTour").value);
  const durationMin = parseFloat(dom("duree").value);
  const totalDistance = laps * distanceTour;
  const stats = updateStats(totalDistance, durationMin);
  const nom = dom(`nom${currentStudent}`).value.trim();
  const prenom = dom(`prenom${currentStudent}`).value.trim();
  const classe = dom(`classe${currentStudent}`).value.trim();
  const vmaRef = dom("vmaRef").value.trim();

  const result = {
    groupe: "", nom, prenom, classe,
    duree: durationMin,
    distance: stats.distanceTotal,
    vitesse: stats.vitesse,
    vma: vmaRef || stats.vmaEstimee,
    etat: currentStudent === 1 ? etat1 : etat2
  };

  if (currentStudent === 1) data1 = result;
  else data2 = result;

  // Mise à jour visuelle
  dom("distanceTotal").textContent = stats.distanceTotal;
  dom("distanceKm").textContent = stats.distanceKm;
  dom("vitesseMoy").textContent = stats.vitesse;
  dom("vmaReal").textContent = stats.vmaEstimee;
}

function startChrono() {
  const dureeMin = parseFloat(dom("duree").value);
  const dureeMs = dureeMin * 60 * 1000;
  startTime = Date.now();
  chronoInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= dureeMs) {
      clearInterval(chronoInterval);
      dom("chronoDisplay").textContent = formatTime(dureeMs);
      dom("lapBtn").disabled = true;
      dom("resetBtn").disabled = false;
      dom("etatForme").style.display = "block";
    } else {
      dom("chronoDisplay").textContent = formatTime(elapsed);
    }
  }, 500);
  dom("startBtn").disabled = true;
  dom("lapBtn").disabled = false;
}

function handleEtatClick(etat) {
  if (currentStudent === 1) {
    etat1 = etat;
    saveStats();
    resetChrono();
    currentStudent = 2;
    dom("startBtn").disabled = false;
    dom("etatForme").style.display = "none";
    dom("chronoDisplay").textContent = "00:00";
    dom("lapsCount").textContent = "0";
  } else {
    etat2 = etat;
    saveStats();
    showQR();
  }
}

function showQR() {
  const qrContainer = dom("qrContainer");
  qrContainer.style.display = "block";
  const qrBox = dom("qrCodeBox");
  qrBox.innerHTML = "";
  const finalData = { ...data1, ...data2 };
  new QRCode(qrBox, {
    text: JSON.stringify(finalData),
    width: 200,
    height: 200
  });
}

dom("startBtn").addEventListener("click", startChrono);
dom("lapBtn").addEventListener("click", () => {
  laps++;
  dom("lapsCount").textContent = laps;
});
dom("resetBtn").addEventListener("click", resetChrono);
document.querySelectorAll(".etatBtn").forEach(btn =>
  btn.addEventListener("click", () => handleEtatClick(btn.dataset.etat))
);

// --- PROFESSEUR ---
dom("profPinSubmit").addEventListener("click", () => {
  if (dom("profPinInput").value === PIN) {
    dom("profDashboard").style.display = "block";
    dom("profAccess").style.display = "none";
    dom("logoutBtn").style.display = "inline-block";
    startScan();
  } else {
    alert("Code incorrect.");
  }
});

dom("logoutBtn").addEventListener("click", () => {
  location.reload();
});

function startScan() {
  const qrReader = new Html5Qrcode("qr-reader");
  qrReader.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
    (decodedText) => {
      try {
        const obj = JSON.parse(decodedText);
        if (!scannedData.some(d => d.nom === obj.nom)) {
          scannedData.push(obj);
          updateTable();
        }
      } catch (e) { }
    },
    (err) => { }
  );
  dom("stopScanBtn").addEventListener("click", () => qrReader.stop());
}

function updateTable() {
  const tbody = dom("resultsBody");
  tbody.innerHTML = "";
  scannedData.forEach((el, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${el.groupe || ""}</td>
      <td>${el.nom}</td>
      <td>${el.prenom}</td>
      <td>${el.classe}</td>
      <td>${el.duree}</td>
      <td>${el.distance}</td>
      <td>${el.vitesse}</td>
      <td>${el.vma}</td>
      <td>${el.etat}</td>`;
    tbody.appendChild(tr);
  });
}

// CSV
dom("exportCsvBtn").addEventListener("click", () => {
  const headers = ["Groupe", "Nom", "Prénom", "Classe", "Durée", "Distance", "Vitesse", "VMA", "État"];
  const rows = scannedData.map(obj => [
    obj.groupe || "", obj.nom, obj.prenom, obj.classe,
    obj.duree, obj.distance, obj.vitesse, obj.vma, obj.etat
  ]);
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "runstats_export.csv";
  a.click();
});

// Groupes
dom("generateGroupsBtn").addEventListener("click", () => {
  const sorted = [...scannedData].sort((a, b) => parseFloat(b.vma) - parseFloat(a.vma));
  const groups = [];
  for (let i = 0; i < sorted.length; i += 4) {
    const group = sorted.slice(i, i + 4);
    group.forEach(e => e.groupe = `G${Math.floor(i / 4) + 1}`);
    groups.push(group);
  }
  updateTable();
});
