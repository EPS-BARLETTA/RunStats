// eleve.js
const form = document.getElementById('eleveForm');
const demarrerBtn = document.getElementById('demarrer');
const plusTourBtn = document.getElementById('plusTour');
const resetBtn = document.getElementById('reset');

const timerSection = document.getElementById('timerSection');
const qrSection = document.getElementById('qrSection');

const timerDisplay = document.getElementById('timer');
const tourCountDisplay = document.getElementById('tourCount');
const distanceParcourueDisplay = document.getElementById('distanceParcourue');
const vitesseDisplay = document.getElementById('vitesse');
const vmaEstimeeDisplay = document.getElementById('vmaEstimee');
const currentRunnerDisplay = document.getElementById('currentRunner');

let duree = 0;
let distanceTour = 0;
let vmaConnue = null;

let timer = null;
let startTime = null;

let tours = 0;
let totalDistance = 0;
let vitesse = 0;

let currentRunner = 1; // 1 or 2
let phaseCourse = 1; // 1 ou 2 (première ou deuxième course)

let eleves = [
  { nom: '', prenom: '', classe: '', sexe: '' },
  { nom: '', prenom: '', classe: '', sexe: '' }
];

// Reset tout à zéro, UI + variables
function reset() {
  clearInterval(timer);
  timer = null;
  startTime = null;
  tours = 0;
  totalDistance = 0;
  vitesse = 0;
  phaseCourse = 1;
  currentRunner = 1;

  tourCountDisplay.textContent = '0';
  distanceParcourueDisplay.textContent = '0';
  vitesseDisplay.textContent = '0';
  vmaEstimeeDisplay.textContent = '-';
  currentRunnerDisplay.textContent = 'Élève 1';

  timerDisplay.textContent = '00:00';

  // Affiche form, masque timer + qr
  form.style.display = 'flex';
  timerSection.classList.add('hidden');
  qrSection.classList.add('hidden');

  // Reset boutons
  plusTourBtn.disabled = true;
  demarrerBtn.disabled = false;
}

// Formate durée en mm:ss
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = duree * 60 * 1000 - elapsed;
    if (remaining <= 0) {
      clearInterval(timer);
      finPhase();
    }
    timerDisplay.textContent = formatTime(Math.max(0, remaining));
  }, 250);
}

// Fin d’une phase (course 1 ou 2)
function finPhase() {
  // Si phase 1 terminée, passer à phase 2
  if (phaseCourse === 1) {
    phaseCourse = 2;
    tours = 0;
    totalDistance = 0;
    vitesse = 0;
    currentRunner = 2;
    currentRunnerDisplay.textContent = 'Élève 2';

    alert('Phase 1 terminée, place à la phase 2. Inversez les rôles.');

    startTimer();
  } else {
    // Phase 2 terminée, afficher résultats + QR code
    alert('Course terminée. Voici les résultats.');

    afficherResultats();
  }
}

// Calculer vitesse instantanée (km/h)
function calculVitesse() {
  // distance parcourue en m divisé par temps en h
  if (!startTime) return 0;
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs === 0) return 0;
  const heures = elapsedMs / 3600000;
  if (heures === 0) return 0;
  return (totalDistance / 1000) / heures;
}

// Estimer VMA = distance max / durée (en km/h)
function estimerVMA() {
  // On prend la distance parcourue pendant la durée donnée, convertie en km/h
  return ((totalDistance / 1000) / (duree / 60)) || 0;
}

function afficherResultats() {
  timerSection.classList.add('hidden');
  qrSection.classList.remove('hidden');

  // Préparer données à stocker (localStorage)
  const data = {
    eleves,
    duree,
    distanceTour,
    vmaConnue,
    tours,
    totalDistance,
    vmaEstimee: estimerVMA()
  };

  // Sauvegarder localStorage sous clé 'runstats_results'
  let stored = localStorage.getItem('runstats_results');
  let allResults = stored ? JSON.parse(stored) : [];
  allResults.push(data);
  localStorage.setItem('runstats_results', JSON.stringify(allResults));

  // Générer QR code JSON (idéalement on encode un résumé)
  const qrData = JSON.stringify(data);

  const canvas = document.getElementById('qrCode');
  QRCode.toCanvas(canvas, qrData, function (error) {
    if (error) console.error(error);
  });
}

// Evenements boutons

demarrerBtn.addEventListener('click', () => {
  // Lire infos form
  eleves[0].nom = document.getElementById('nom1').value.trim();
  eleves[0].prenom = document.getElementById('prenom1').value.trim();
  eleves[0].classe = document.getElementById('classe1').value.trim();
  eleves[0].sexe = document.getElementById('sexe1').value;

  eleves[1].nom = document.getElementById('nom2').value.trim();
  eleves[1].prenom = document.getElementById('prenom2').value.trim();
  eleves[1].classe = document.getElementById('classe2').value.trim();
  eleves[1].sexe = document.getElementById('sexe2').value;

  duree = Number(document.getElementById('duree').value);
  distanceTour = Number(document.getElementById('distanceTour').value);
  const vmaInput = document.getElementById('vmaConnue').value;
  vmaConnue = vmaInput ? Number(vmaInput) : null;

  if (
    !eleves[0].nom || !eleves[0].prenom || !eleves[0].classe || !eleves[0].sexe ||
    !eleves[1].nom || !eleves[1].prenom || !eleves[1].classe || !eleves[1].sexe ||
    !duree || !distanceTour
  ) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }

  // Cacher formulaire, afficher timer + stats
  form.style.display = 'none';
  timerSection.classList.remove('hidden');

  demarrerBtn.disabled = true;
  plusTourBtn.disabled = false;

  startTimer();
});

plusTourBtn.addEventListener('click', () => {
  tours++;
  totalDistance = tours * distanceTour;

  tourCountDisplay.textContent = tours;
  distanceParcourueDisplay.textContent = totalDistance;

  vitesse = calculVitesse();
  vitesseDisplay.textContent = vitesse.toFixed(2);

  const vmaEst = estimerVMA();
  vmaEstimeeDisplay.textContent = vmaEst.toFixed(2);

  // Alterner coureur
  currentRunner = currentRunner === 1 ? 2 : 1;
  currentRunnerDisplay.textContent = `Élève ${currentRunner}`;
});

resetBtn.addEventListener('click', () => {
  if (confirm('Voulez-vous vraiment réinitialiser la saisie ?')) {
    reset();
  }
});

// Init
reset();
