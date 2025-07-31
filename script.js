// Variables globales
let chronoInterval;
let chronoStartTime;
let chronoRunning = false;
let tours = [];
let currentRunner = 1;
let runnersData = { 1: {}, 2: {} };

// Récupérer les éléments du DOM
const chronoDisplay = document.getElementById('chronoDisplay');
const btnStart = document.getElementById('btnStart');
const btnLap = document.getElementById('btnLap');
const btnReset = document.getElementById('btnReset');
const etatFormeDiv = document.getElementById('etatForme');
const qrContainer = document.getElementById('qrContainer');
const tableBody = document.querySelector('#resultTable tbody');

// Fonction pour formater le temps
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Démarrer / Arrêter le chrono
btnStart.addEventListener('click', () => {
  if (!chronoRunning) {
    chronoRunning = true;
    chronoStartTime = Date.now();
    chronoInterval = setInterval(updateChrono, 100);
    btnStart.textContent = "Stop";
    btnLap.disabled = false;
  } else {
    chronoRunning = false;
    clearInterval(chronoInterval);
    btnStart.textContent = "Start";
    btnLap.disabled = true;
  }
});

// Mettre à jour l'affichage du chrono
function updateChrono() {
  let elapsed = Date.now() - chronoStartTime;
  chronoDisplay.textContent = formatTime(elapsed);
}

// Lap = enregistrer la distance d’un tour
btnLap.addEventListener('click', () => {
  let distance = parseInt(document.getElementById(`distance${currentRunner}`).value);
  if (distance && distance > 0) {
    tours.push(distance);
    alert(`Tour ajouté: ${distance}m`);
  } else {
    alert("Entrez une distance valide.");
  }
});

// Reset chrono
btnReset.addEventListener('click', () => {
  chronoRunning = false;
  clearInterval(chronoInterval);
  chronoDisplay.textContent = "0:00";
  tours = [];
  btnStart.textContent = "Start";
  btnLap.disabled = true;
});

// Calculer les stats
function calculStats() {
  let totalDistance = tours.reduce((a, b) => a + b, 0);
  let timeSeconds = (Date.now() - chronoStartTime) / 1000;
  let vitesseMoyenne = (totalDistance / timeSeconds) * 3.6; // km/h
  let vmaEstime = vitesseMoyenne * 1.05;

  return {
    totalDistance,
    vitesseMoyenne: vitesseMoyenne.toFixed(2),
    vmaEstime: vmaEstime.toFixed(2)
  };
}

// Gestion état de forme (emoji)
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

    if (currentRunner === 1) {
      currentRunner = 2;
      tours = [];
      btnReset.click();
      alert("Deuxième coureur, préparez-vous !");
    } else {
      afficherQRCode();
      remplirTableau();
    }
  });
});

// Générer QR Code avec données des 2 coureurs
function afficherQRCode() {
  let data = JSON.stringify(runnersData);
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: data,
    width: 200,
    height: 200
  });
}

// Remplir tableau des résultats
function remplirTableau() {
  tableBody.innerHTML = `
    <tr>
      <td>${runnersData[1].nom}</td>
      <td>${runnersData[1].vmaEstime}</td>
      <td>${runnersData[1].sexe}</td>
    </tr>
    <tr>
      <td>${runnersData[2].nom}</td>
      <td>${runnersData[2].vmaEstime}</td>
      <td>${runnersData[2].sexe}</td>
    </tr>
  `;
}

// Tri en groupes de 4 équilibrés
function creerGroupesEquilibres() {
  let eleves = [
    runnersData[1],
    runnersData[2],
    // Si tu as plus d'élèves, tu peux les ajouter ici
  ];

  // Tri par VMA décroissante
  eleves.sort((a, b) => b.vmaEstime - a.vmaEstime);

  let groupes = [];
  while (eleves.length >= 4) {
    let groupe = [
      eleves.shift(),        // meilleur
      eleves.pop(),          // moins bon
      eleves.shift(),        // 2e meilleur
      eleves.pop()           // 2e moins bon
    ];
    groupes.push(groupe);
  }

  console.log("Groupes équilibrés :", groupes);
  return groupes;
}
