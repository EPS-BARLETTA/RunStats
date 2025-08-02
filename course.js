// Récupération des données envoyées depuis eleve.html via sessionStorage
const eleve1Data = JSON.parse(sessionStorage.getItem('eleve1'));
const eleve2Data = JSON.parse(sessionStorage.getItem('eleve2'));
const courseNumber = sessionStorage.getItem('courseNumber') || '1'; // 1 ou 2

// Constantes pour le calcul
const tourDistance = 400; // Exemple: 400m par tour

// Éléments DOM
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const runnerInfo = document.getElementById('runnerInfo');
const timerDisplay = document.getElementById('timerDisplay');
const timerCircle = document.getElementById('timerCircle');
const addTourBtn = document.getElementById('addTourBtn');
const totalDistanceEl = document.getElementById('totalDistance');
const avgSpeedEl = document.getElementById('avgSpeed');
const estimatedVMAEl = document.getElementById('estimatedVMA');
const finishingOptions = document.getElementById('finishingOptions');
const fractionButtons = document.querySelectorAll('.fractionBtn');
const nextCourseBtn = document.getElementById('nextCourseBtn');

let totalTours = 0;
let totalDistance = 0;
let startTime = null;
let timerInterval = null;
let courseDuration = 0; // en secondes, fixé par l'utilisateur dans eleve.html

// Initialisation affichage selon coureur
let currentRunner = null;
if (courseNumber === '1') {
  currentRunner = eleve1Data;
  pageTitle.textContent = 'RunStats';
  pageSubtitle.textContent = 'course - Élève 1';
  runnerInfo.textContent = `${currentRunner.prenom} ${currentRunner.nom} - Classe: ${currentRunner.classe} - Sexe: ${currentRunner.sexe}`;
  runnerInfo.style.backgroundColor = '#d1f7d6'; // vert clair
} else {
  currentRunner = eleve2Data;
  pageTitle.textContent = 'RunStats';
  pageSubtitle.textContent = 'course - Élève 2';
  runnerInfo.textContent = `${currentRunner.prenom} ${currentRunner.nom} - Classe: ${currentRunner.classe} - Sexe: ${currentRunner.sexe}`;
  runnerInfo.style.backgroundColor = '#d1e7ff'; // bleu clair
}

// Récupérer la durée de course (en secondes) depuis sessionStorage
courseDuration = parseInt(sessionStorage.getItem('courseDuration'), 10) || 600; // défaut 10 minutes = 600s

// Démarrer le minuteur
function startTimer() {
  startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 500);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = courseDuration - elapsed;

  if (remaining <= 10 && remaining > 0) {
    timerCircle.classList.add('blink');
  } else {
    timerCircle.classList.remove('blink');
  }

  if (remaining <= 0) {
    clearInterval(timerInterval);
    timerDisplay.textContent = "00:00";
    timerCircle.classList.remove('blink');
    showFinishingOptions();
  } else {
    timerDisplay.textContent = formatTime(remaining);
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Ajouter un tour complet
addTourBtn.addEventListener('click', () => {
  totalTours++;
  updateStats();
});

// Ajouter fraction de tour à la fin
fractionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const fraction = parseFloat(btn.dataset.fraction);
    totalDistance += fraction * tourDistance;
    updateStats();
    finishingOptions.style.display = 'none';
    nextCourseBtn.style.display = 'inline-block';
  });
});

nextCourseBtn.addEventListener('click', () => {
  // Sauvegarder données de la course courante
  saveCourseData();

  if (courseNumber === '1') {
    // Lancer course 2
    sessionStorage.setItem('courseNumber', '2');
    window.location.href = 'course.html';
  } else {
    // Fin des deux courses, aller au bilan
    window.location.href = 'summary.html';
  }
});

function updateStats() {
  // Calcul distance totale
  totalDistance = totalTours * tourDistance;
  totalDistanceEl.textContent = totalDistance.toFixed(1);

  // Calcul vitesse moyenne (km/h)
  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  const speedKmh = (totalDistance / 1000) / elapsedMinutes || 0;
  avgSpeedEl.textContent = speedKmh.toFixed(2);

  // Estimation VMA (exemple simple : vitesse max = vitesse moyenne * 1.1)
  const estimatedVMA = speedKmh * 1.1;
  estimatedVMAEl.textContent = estimatedVMA.toFixed(2);
}

function showFinishingOptions() {
  finishingOptions.style.display = 'block';
  addTourBtn.disabled = true;
}

// Sauvegarder données dans sessionStorage pour résumé final
function saveCourseData() {
  const courseData = {
    nom: currentRunner.nom,
    prenom: currentRunner.prenom,
    classe: currentRunner.classe,
    sexe: currentRunner.sexe,
    distance: totalDistance,
    vitesse: parseFloat(avgSpeedEl.textContent),
    vma: parseFloat(estimatedVMAEl.textContent)
  };

  sessionStorage.setItem(`course${courseNumber}Data`, JSON.stringify(courseData));
}

// Lancer la course automatiquement au chargement
startTimer();
