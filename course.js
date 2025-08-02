// course.js

// Données des élèves + course (transmises depuis page précédente via sessionStorage)
const eleve1 = JSON.parse(sessionStorage.getItem('eleve1')) || {};
const eleve2 = JSON.parse(sessionStorage.getItem('eleve2')) || {};
const courseInfo = JSON.parse(sessionStorage.getItem('courseInfo')) || {};

const timerDisplay = document.getElementById('timer');
const timerCircle = document.getElementById('timer-circle');
const startBtn = document.getElementById('startCourseBtn');
const addTourBtn = document.getElementById('addTourBtn');
const fractionToursDiv = document.getElementById('fraction-tours');
const finishCourseBtn = document.getElementById('finishCourseBtn');
const nextCourseBtn = document.getElementById('nextCourseBtn');

const totalDistanceSpan = document.getElementById('total-distance');
const avgSpeedSpan = document.getElementById('avg-speed');
const vmaEstimateSpan = document.getElementById('vma-estimate');

const eleve1Nom = document.getElementById('eleve1-nom');
const eleve1Prenom = document.getElementById('eleve1-prenom');
const eleve1Classe = document.getElementById('eleve1-classe');
const eleve1Sexe = document.getElementById('eleve1-sexe');

const eleve2Nom = document.getElementById('eleve2-nom');
const eleve2Prenom = document.getElementById('eleve2-prenom');
const eleve2Classe = document.getElementById('eleve2-classe');
const eleve2Sexe = document.getElementById('eleve2-sexe');

const courseDurationSpan = document.getElementById('course-duration');
const courseDistanceSpan = document.getElementById('course-distance');

const timerContainer = document.getElementById('timer-container');

let timer = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let currentEleve = 1;
let running = false;

let tourCount = 0;
let fractionTourAdded = 0;

const tourDistance = courseInfo.distance ? parseFloat(courseInfo.distance) : 400;
const courseDurationMinutes = courseInfo.duration ? parseInt(courseInfo.duration) : 10;

courseDurationSpan.textContent = courseDurationMinutes + ' min';
courseDistanceSpan.textContent = tourDistance + ' m';

eleve1Nom.textContent = eleve1.nom || '';
eleve1Prenom.textContent = eleve1.prenom || '';
eleve1Classe.textContent = eleve1.classe || '';
eleve1Sexe.textContent = eleve1.sexe || '';

eleve2Nom.textContent = eleve2.nom || '';
eleve2Prenom.textContent = eleve2.prenom || '';
eleve2Classe.textContent = eleve2.classe || '';
eleve2Sexe.textContent = eleve2.sexe || '';

// Reset stats variables
function resetStats() {
  tourCount = 0;
  fractionTourAdded = 0;
  totalDistanceSpan.textContent = '0';
  avgSpeedSpan.textContent = '0';
  vmaEstimateSpan.textContent = '0';
}

// Format seconds to mm:ss
function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function updateStats() {
  const totalTours = tourCount + fractionTourAdded;
  const totalDistanceMeters = totalTours * tourDistance;
  totalDistanceSpan.textContent = totalDistanceMeters.toFixed(1);

  const totalHours = courseDurationMinutes / 60;
  const speedKmh = totalDistanceMeters / 1000 / totalHours;
  avgSpeedSpan.textContent = speedKmh.toFixed(2);

  // Estimation VMA = vitesse moyenne * 1.06 (valeur approximative)
  const vmaEst = speedKmh * 1.06;
  vmaEstimateSpan.textContent = vmaEst.toFixed(2);
}

function tick() {
  if (remainingSeconds <= 0) {
    clearInterval(timer);
    running = false;
    timerCircle.classList.remove('blink');
    fractionToursDiv.classList.remove('hidden');
    addTourBtn.disabled = true;
    finishCourseBtn.disabled = false;
    return;
  }

  remainingSeconds--;
  timerDisplay.textContent = formatTime(remainingSeconds);

  if (remainingSeconds <= 10) {
    timerCircle.classList.add('blink');
  }
}

function startTimer() {
  if (running) return;
  running = true;
  remainingSeconds = courseDurationMinutes * 60;
  timerDisplay.textContent = formatTime(remainingSeconds);
  timerCircle.classList.remove('blink');
  fractionToursDiv.classList.add('hidden');
  addTourBtn.disabled = false;
  finishCourseBtn.disabled = true;
  timer = setInterval(tick, 1000);
}

function addTour() {
  if (!running) return;
  tourCount++;
  updateStats();
}

function addFractionTour(fraction) {
  fractionTourAdded += fraction;
  updateStats();
  fractionToursDiv.classList.add('hidden');
}

function finishCourse() {
  clearInterval(timer);
  running = false;
  fractionToursDiv.classList.add('hidden');
  addTourBtn.disabled = true;
  finishCourseBtn.disabled = true;

  // Stocker les résultats dans sessionStorage pour bilan final
  const result = {
    nom: currentEleve === 1 ? eleve1.nom : eleve2.nom,
    prenom: currentEleve === 1 ? eleve1.prenom : eleve2.prenom,
    classe: currentEleve === 1 ? eleve1.classe : eleve2.classe,
    sexe: currentEleve === 1 ? eleve1.sexe : eleve2.sexe,
    distance: (tourCount + fractionTourAdded) * tourDistance,
    vitesse: parseFloat(avgSpeedSpan.textContent),
    vma: parseFloat(vmaEstimateSpan.textContent),
  };

  if (currentEleve === 1) {
    sessionStorage.setItem('resultEleve1', JSON.stringify(result));
    startBtn.classList.add('hidden');
    nextCourseBtn.classList.remove('hidden');
  } else {
    sessionStorage.setItem('resultEleve2', JSON.stringify(result));
    // Aller à la page résumé
    window.location.href = 'summary.html';
  }
}

function startCourse() {
  startTimer();
  startBtn.classList.add('hidden');
  timerContainer.classList.remove('hidden');
}

function startSecondCourse() {
  // Reset tout pour élève 2
  currentEleve = 2;
  resetStats();
  remainingSeconds = courseDurationMinutes * 60;
  timerDisplay.textContent = formatTime(remainingSeconds);
  timerCircle.classList.remove('blink');

  // Mettre à jour affichage élève 2
  document.querySelector('.eleve-card.eleve-1 h3').textContent = `Élève 2 (observateur)`;
  document.querySelector('.eleve-card.eleve-2 h3').textContent = `Élève 1 (observateur)`;

  // Swap noms/prénoms dans les affichages
  eleve1Nom.textContent = eleve2.nom || '';
  eleve1Prenom.textContent = eleve2.prenom || '';
  eleve1Classe.textContent = eleve2.classe || '';
  eleve1Sexe.textContent = eleve2.sexe || '';

  eleve2Nom.textContent = eleve1.nom || '';
  eleve2Prenom.textContent = eleve1.prenom || '';
  eleve2Classe.textContent = eleve1.classe || '';
  eleve2Sexe.textContent = eleve1.sexe || '';

  nextCourseBtn.classList.add('hidden');
  timerContainer.classList.remove('hidden');
  addTourBtn.disabled = false;
  finishCourseBtn.disabled = true;

  startTimer();
}

startBtn.addEventListener('click', startCourse);
addTourBtn.addEventListener('click', addTour);
finishCourseBtn.addEventListener('click', finishCourse);
nextCourseBtn.addEventListener('click', startSecondCourse);

// Initialisation affichage
resetStats();
timerDisplay.textContent = formatTime(courseDurationMinutes * 60);
timerContainer.classList.add('hidden');
nextCourseBtn.classList.add('hidden');
finishCourseBtn.disabled = true;
