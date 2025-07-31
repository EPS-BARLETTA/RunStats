// === Variables générales ===
let laps = 0;
let countdownTime, countdownTimer;
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
  if (!duree) return;

  const tempsHeure = duree / 60;
  const distanceKm = distanceTotal / 1000;
  const vitesseMoy = (distanceTotal / (duree * 60)).toFixed(2); // m/s
  const vitesseMoyKmH = (distanceKm / tempsHeure).toFixed(2); // km/h
  const vma = (distanceKm / (tempsHeure * 0.92)).toFixed(2);

  document.getElementById('distanceTotal').innerHTML = `<div>Distance totale (m)</div><div class="stat-value">${distanceTotal}</div>`;
  document.getElementById('vitesseMoy').innerHTML = `<div>Vitesse moyenne (km/h)</div><div class="stat-value">${vitesseMoyKmH}</div>`;
  document.getElementById('vmaReal').innerHTML = `<div>VMA estimée (km/h)</div><div class="stat-value">${vma}</div>`;
}

// === Ressenti ===
const etatButtons = document.querySelectorAll('.etatBtn');
etatButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;

    const duree = parseFloat(document.getElementById('duree').value);
    if (!duree) {
      alert("Remplissez la durée avant de valider l'état.");
      return;
    }
    const distance = distanceTotal;
    const distanceKm = (distance / 1000).toFixed(2);
    const vitesse = (distanceKm / (duree / 60)).toFixed(2);
    const vma = (distanceKm / ((duree / 60) * 0.92)).toFixed(2);
    const vmaRef = parseFloat(document.getElementById('vmaRef').value);

    const infos = {
      nom: course1Done ? document.getElementById('nom2').value.trim() : document.getElementById('nom1').value.trim(),
      prenom: course1Done ? document.getElementById('prenom2').value.trim() : document.getElementById('prenom1').value.trim(),
      classe: course1Done ? document.getElementById('classe2').value.trim() : document.getElementById('classe1').value.trim(),
      sexe: course1Done ? document.getElementById('sexe2').value : document.getElementById('sexe1').value,
      duree,
      distance,
      vitesse,
      vma,
      etat,
      vmaRef: isNaN(vmaRef) ? '' : vmaRef
    };

    if (!infos.nom || !infos.prenom || !infos.classe) {
      alert("Veuillez remplir toutes les informations personnelles.");
      return;
    }

    if (!course1Done) {
      eleve1 = infos;
      resetBtn.click();
      course1Done = true;
      alert("Première course terminée. Veuillez saisir les infos du deuxième coureur et lancer la deuxième course.");
    } else {
      eleve2 = infos;
      course1Done = false;
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
      <td>${index + 1}</td>
      <td>${data.nom}</td>
      <td>${data.prenom}</td>
      <td>${data.classe}</td>
      <td>${data.sexe}</td>
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
  let csv = "Nom,Prénom,Classe,Sexe,Durée,Distance,Vitesse,VMA,État\n";
  qrDataArray.forEach(d => {
    csv += `${d.nom},${d.prenom},${d.classe},${d.sexe},${d.duree},${d.distance},${d.vitesse},${d.vma},${d.etat}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_runstats.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// === Tri et groupes ===
// Groupe 4 élèves : 1 VMA haute, 1 basse, 2 moyennes, mixité garçons/filles
document.getElementById('groupBtn').addEventListener('click', () => {
  if (qrDataArray.length < 4) {
    alert("Il faut au moins 4 élèves pour créer des groupes.");
    return;
  }

  // Tri selon VMA (desc), sexe, puis mélange
  const sorted = [...qrDataArray].sort((a, b) => parseFloat(b.vma) - parseFloat(a.vma));

  const groupes = [];
  let groupe = [];

  // Séparer les profils VMA
  const haute = sorted.filter(e => parseFloat(e.vma) >= 14);
  const moyenne = sorted.filter(e => parseFloat(e.vma) < 14 && parseFloat(e.vma) >= 11);
  const basse = sorted.filter(e => parseFloat(e.vma) < 11);

  // Fonction pour choisir mixité (équilibrer garçons/filles)
  function pickWithMixity(arr, sexeToAvoid = null) {
    for (let i = 0; i < arr.length; i++) {
      if (!sexeToAvoid || arr[i].sexe !== sexeToAvoid) {
        return arr.splice(i, 1)[0];
      }
    }
    // Si pas possible, prendre le premier
    return arr.shift();
  }

  while (haute.length || moyenne.length || basse.length) {
    groupe = [];

    // 1 haute
    if (haute.length) groupe.push(haute.shift());
    // 2 moyennes
    for (let i = 0; i < 2; i++) {
      if (moyenne.length) groupe.push(moyenne.shift());
      else if (basse.length) groupe.push(basse.shift()); // au cas où moyenne insuffisante
      else if (haute.length) groupe.push(haute.shift());
    }
    // 1 basse
    if (basse.length) groupe.push(basse.shift());
    else if (moyenne.length) groupe.push(moyenne.shift());

    // Assurer mixité garçon/fille dans le groupe, sinon ajuster (simplification)
    const sexeCount = groupe.reduce((acc, e) => {
      acc[e.sexe] = (acc[e.sexe] || 0) + 1;
      return acc;
    }, {});

    // Si pas de mixité (par ex. tout garçon ou tout fille)
    if (Object.keys(sexeCount).length === 1 && qrDataArray.length > 3) {
      // Essayer d'échanger un membre avec un autre groupe ou la liste
      // Ici simplifié, on pourrait améliorer selon le besoin
    }

    groupes.push(groupe);
  }

  // Afficher groupes
  const groupeContainer = document.getElementById('groupesResult');
  if (!groupeContainer) {
    alert("Pas de conteneur pour afficher les groupes.");
    return;
  }
  groupeContainer.innerHTML = '<h3>Groupes formés :</h3>';
  groupes.forEach((grp, i) => {
    const div = document.createElement('div');
    div.style.marginBottom = '1em';
    div.innerHTML = `<strong>Groupe ${i + 1}</strong><br>` + grp.map(e => `${e.prenom} ${e.nom} (${e.sexe}) - VMA: ${e.vma}`).join('<br>');
    groupeContainer.appendChild(div);
  });
});
