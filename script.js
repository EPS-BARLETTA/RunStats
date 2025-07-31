// Variables globales
let laps = 0;
let countdownTime, countdownTimer;
let eleve1 = {}, eleve2 = {};
let course1Done = false;
let distanceTotal = 0;
let qrDataArray = [];

// Chrono et boutons
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
  document.getElementById('etatForme').style.display = 'none';
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
    chronoDisplay.style.color = countdownTime <= 10 ? 'red' : 'black';
    updateStats();
  }, 1000);
}

// Mise à jour stats visibles sous titre
function updateStats() {
  const duree = parseFloat(document.getElementById('duree').value);
  if (!duree) return;
  const tempsHeure = duree / 60;
  const vitesseKmH = ((distanceTotal / 1000) / tempsHeure).toFixed(2);
  const vma = ((distanceTotal / 1000) / (tempsHeure * 0.92)).toFixed(2);
  document.getElementById('distanceTotal').innerHTML = `<div>Distance totale (m)</div><div class="stat-value">${distanceTotal}</div>`;
  document.getElementById('vitesseMoy').innerHTML = `<div>Vitesse moyenne (km/h)</div><div class="stat-value">${vitesseKmH}</div>`;
  document.getElementById('vmaReal').innerHTML = `<div>VMA estimée (km/h)</div><div class="stat-value">${vma}</div>`;
}

// Gestion ressenti / état de forme
document.querySelectorAll('.etatBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;
    const duree = parseFloat(document.getElementById('duree').value);
    if (!duree) {
      alert("Remplissez la durée avant de valider l'état.");
      return;
    }
    const infos = {
      nom: course1Done ? document.getElementById('nom2').value.trim() : document.getElementById('nom1').value.trim(),
      prenom: course1Done ? document.getElementById('prenom2').value.trim() : document.getElementById('prenom1').value.trim(),
      classe: course1Done ? document.getElementById('classe2').value.trim() : document.getElementById('classe1').value.trim(),
      sexe: course1Done ? document.getElementById('sexe2').value : document.getElementById('sexe1').value,
      duree,
      distance: distanceTotal,
      vitesse: ((distanceTotal / 1000) / (duree / 60)).toFixed(2),
      vma: ((distanceTotal / 1000) / ((duree / 60) * 0.92)).toFixed(2),
      etat
    };
    if (!infos.nom || !infos.prenom || !infos.classe) {
      alert("Veuillez remplir toutes les informations personnelles.");
      return;
    }
    if (!course1Done) {
      eleve1 = infos;
      resetBtn.click();
      course1Done = true;
      alert("Première course terminée. Veuillez saisir les infos du deuxième coureur.");
    } else {
      eleve2 = infos;
      course1Done = false;
      generateQRCode([eleve1, eleve2]);
      document.getElementById('etatForme').style.display = "none";
      qrDataArray.push(eleve1, eleve2);
      updateTable();
    }
  });
});

function showEtatForme() {
  document.getElementById('etatForme').style.display = "block";
}

// Génération QR code
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

// Accès prof et scan QR
document.getElementById("profPinSubmit").addEventListener("click", () => {
  if (document.getElementById("profPinInput").value === "1976") {
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("studentInput").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    startQrScanner();
  } else alert("Code incorrect.");
});

document.getElementById("logoutBtn").addEventListener("click", () => location.reload());

function startQrScanner() {
  const qrReader = new Html5Qrcode("qr-reader");
  qrReader.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
    decoded => {
      try {
        const data = JSON.parse(decoded);
        data.forEach(e => qrDataArray.push(e));
        updateTable();
      } catch {
        console.error("QR code non lisible");
      }
    }
  );
  document.getElementById("stopScanBtn").addEventListener("click", () => {
    qrReader.stop().then(() => (document.getElementById("qr-reader").innerHTML = ""));
  });
}

// Mise à jour tableau résultats
function updateTable() {
  const tbody = document.getElementById("resultsBody");
  tbody.innerHTML = "";
  qrDataArray.forEach((d, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${d.nom}</td>
      <td>${d.prenom}</td>
      <td>${d.classe}</td>
      <td>${d.sexe}</td>
      <td>${d.duree}</td>
      <td>${d.distance}</td>
      <td>${d.vitesse}</td>
      <td>${d.vma}</td>
      <td>${d.etat}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export CSV
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  let csv = "Nom,Prénom,Classe,Sexe,Durée,Distance,Vitesse,VMA,État\n";
  qrDataArray.forEach(d => {
    csv += `${d.nom},${d.prenom},${d.classe},${d.sexe},${d.duree},${d.distance},${d.vitesse},${d.vma},${d.etat}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resultats_runstats.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Tri et création groupes de 4 : 1 haute, 2 moyennes, 1 basse VMA + mixité sexe
document.getElementById('groupBtn').addEventListener('click', () => {
  if (qrDataArray.length < 4) {
    alert("Au moins 4 élèves nécessaires pour créer des groupes.");
    return;
  }
  // Séparation VMA
  const haute = qrDataArray.filter(e => parseFloat(e.vma) >= 14);
  const moyenne = qrDataArray.filter(e => parseFloat(e.vma) >= 11 && parseFloat(e.vma) < 14);
  const basse = qrDataArray.filter(e => parseFloat(e.vma) < 11);

  const groupes = [];
  while (haute.length || moyenne.length || basse.length) {
    const groupe = [];
    if (haute.length) groupe.push(haute.shift());
    for (let i = 0; i < 2; i++) {
      if (moyenne.length) groupe.push(moyenne.shift());
      else if (basse.length) groupe.push(basse.shift());
      else if (haute.length) groupe.push(haute.shift());
    }
    if (basse.length) groupe.push(basse.shift());
    else if (moyenne.length) groupe.push(moyenne.shift());

    groupes.push(groupe);
  }

  // Affichage groupes
  const container = document.getElementById('groupesResult');
  container.innerHTML = "<h3>Groupes formés :</h3>";
  groupes.forEach((grp, i) => {
    const div = document.createElement('div');
    div.style.marginBottom = "1em";
    div.innerHTML = `<strong>Groupe ${i + 1}</strong><br>` + grp.map(e => `${e.prenom} ${e.nom} (${e.sexe}) - VMA: ${e.vma}`).join('<br>');
    container.appendChild(div);
  });
});
