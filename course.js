// Variables de base
let duration = 600; // durée en secondes (10 min par défaut)
let distanceParTour = 400; // exemple distance d'un tour en mètres
let toursCount = 0;
let fractionDistance = 0;
let startTime = null;
let timerInterval = null;

const timerDisplay = document.getElementById('timerDisplay');
const timerCircle = document.getElementById('timerCircle');
const addTourBtn = document.getElementById('addTourBtn');
const totalDistanceElem = document.getElementById('totalDistance');
const avgSpeedElem = document.getElementById('avgSpeed');
const vmaEstimateElem = document.getElementById('vmaEstimate');
const endCourseSection = document.getElementById('endCourseSection');
const nextCourseSection = document.getElementById('nextCourseSection');
const finishCourseBtn = document.getElementById('finishCourseBtn');
const startNextCourseBtn = document.getElementById('startNextCourseBtn');
const goToSummaryBtn = document.getElementById('goToSummaryBtn');
const fractionBtns = document.querySelectorAll('.fractionBtn');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateStats() {
  const totalDist = (toursCount + fractionDistance) * distanceParTour;
  totalDistanceElem.textContent = totalDist.toFixed(2);

  const elapsedTime = (Date.now() - startTime) / 1000; // en secondes
  const speedMps = totalDist / elapsedTime; // m/s
  const speedKph = speedMps * 3.6;
  avgSpeedElem.textContent = isFinite(speedKph) ? speedKph.toFixed(2) : '0.00';

  // VMA estimée ici = vitesse max atteinte, pour exemple on prend vitesse moyenne + 10%
  const vma = speedKph * 1.1;
  vmaEstimateElem.textContent = isFinite(vma) ? vma.toFixed(2) : '0.00';
}

function startTimer() {
  startTime = Date.now();
  let remaining = duration;

  timerDisplay.textContent = formatTime(remaining);
  timerCircle.style.backgroundColor = '#4CAF50'; // vert normal

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    remaining = duration - elapsed;

    if (remaining < 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = '00:00';
      timerCircle.style.backgroundColor = '#f44336'; // rouge fin
      onTimerEnd();
      return;
    }

    timerDisplay.textContent = formatTime(remaining);

    // Clignotement dernier 10 secondes
    if (remaining <= 10) {
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        timerCircle.style.backgroundColor = '#f44336';
      } else {
        timerCircle.style.backgroundColor = '#fff';
      }
    }

    updateStats();
  }, 200);
}

function onTimerEnd() {
  // Désactiver bouton + Tour
  addTourBtn.disabled = true;
  // Afficher la section pour ajouter fraction de tour
  endCourseSection.style.display = 'block';
}

addTourBtn.addEventListener('click', () => {
  toursCount++;
  updateStats();
});

fractionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    fractionDistance = parseFloat(btn.dataset.fraction);
    updateStats();
  });
});

finishCourseBtn.addEventListener('click', () => {
  // Ajouter la fraction à la distance totale
  toursCount += fractionDistance;
  fractionDistance = 0;
  updateStats();

  endCourseSection.style.display = 'none';
  nextCourseSection.style.display = 'block';
});

startNextCourseBtn.addEventListener('click', () => {
  // Reset tout pour nouvelle course
  toursCount = 0;
  fractionDistance = 0;
  startTime = null;
  addTourBtn.disabled = false;
  nextCourseSection.style.display = 'none';
  endCourseSection.style.display = 'none';
  timerDisplay.textContent = formatTime(duration);
  timerCircle.style.backgroundColor = '#4CAF50';

  startTimer();
});

goToSummaryBtn.addEventListener('click', () => {
  // Redirection vers la page bilan (à créer)
  window.location.href = 'summary.html';
});

// Démarrage automatique du timer à l'ouverture de la page
startTimer();
