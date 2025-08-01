// eleve.js

const startBtn = document.getElementById('startBtn');
const plusTourBtn = document.getElementById('plusTourBtn');
const resetBtn = document.getElementById('resetBtn');

const inputSection = document.getElementById('inputSection');
const courseInputs = document.getElementById('courseInputs');
const courseSection = document.getElementById('courseSection');

const timerDisplay = document.getElementById('timer');
const nbToursDisplay = document.getElementById('nbTours');
const distanceParcourueDisplay = document.getElementById('distanceParcourue');
const vitesseMoyenneDisplay = document.getElementById('vitesseMoyenne');
const vmaEstimeeDisplay = document.getElementById('vmaEstimee');

let duration = 0; // en minutes
let distanceTour = 0; // en mètres
let vmaConnue = 0; // km/h, optionnel

let timerInterval = null;
let timeElapsed = 0; // en secondes
let nbTours = 0;

// Convert seconds to mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function validateInputs() {
  const nom1 = document.getElementById('nom1').value.trim();
  const prenom1 = document.getElementById('prenom1').value.trim();
  const classe1 = document.getElementById('classe1').value.trim();
  const sexe1 = document.getElementById('sexe1').value;

  const nom2 = document.getElementById('nom2').value.trim();
  const prenom2 = document.getElementById('prenom2').value.trim();
  const classe2 = document.getElementById('classe2').value.trim();
  const sexe2 = document.getElementById('sexe2').value;

  duration = parseInt(document.getElementById('dureeCourse').value, 10);
  distanceTour = parseFloat(document.getElementById('distanceTour').value);
  vmaConnue = parseFloat(document.getElementById('vmaConnue').value);

  if (!nom1 || !prenom1 || !classe1 || !sexe1 ||
      !nom2 || !prenom2 || !classe2 || !sexe2) {
    alert('Veuillez remplir toutes les informations des deux élèves.');
    return false;
  }

  if (isNaN(duration) || duration <= 0) {
    alert('Veuillez entrer une durée de course valide (minutes).');
    return false;
  }
  if (isNaN(distanceTour) || distanceTour <= 0) {
    alert('Veuillez entrer une distance de tour valide (en mètres).');
    return false;
  }
  // vmaConnue est optionnel, donc pas de contrôle strict

  return true;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = formatTime(timeElapsed);

    if (timeElapsed >= duration * 60) {
      stopTimer();
      alert('Temps écoulé !');
      // TODO: gérer fin de course / bascule à la suite
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetCourse() {
  stopTimer();
  timeElapsed = 0;
  nbTours = 0;
  timerDisplay.textContent = '00:00';
  nbToursDisplay.textContent = '0';
  distanceParcourueDisplay.textContent = '0';
  vitesseMoyenneDisplay.textContent = '0';
  vmaEstimeeDisplay.textContent = '0';

  // Afficher à nouveau la saisie
  inputSection.style.display = 'flex';
  courseInputs.style.display = 'block';
  courseSection.style.display = 'none';

  startBtn.disabled = false;
  plusTourBtn.disabled = true;
  resetBtn.disabled = true;
}

// Calcul vitesse moyenne km/h : distance parcourue / temps (en h)
function calculerVitesseMoyenne() {
  if (timeElapsed === 0) return 0;
  const distanceKm = (distanceTour * nbTours) / 1000;
  const tempsHeures = timeElapsed / 3600;
  return distanceKm / tempsHeures;
}

// Estimation VMA (simplifiée, ici égale à vitesse moyenne si vmaConnue non fournie)
function estimerVMA() {
  if (!vmaConnue || isNaN(vmaConnue) || vmaConnue <= 0) {
    return calculerVitesseMoyenne();
  }
  // Pour l’exemple, on peut pondérer ou juste retourner vmaConnue
  return vmaConnue;
}

startBtn.addEventListener('click', () => {
  if (!validateInputs()) return;

  // Cacher les inputs et afficher le timer & boutons
  inputSection.style.display = 'none';
  courseInputs.style.display = 'none';
  courseSection.style.display = 'block';

  startBtn.disabled = true;
  plusTourBtn.disabled = false;
  resetBtn.disabled = false;

  timeElapsed = 0;
  nbTours = 0;
  timerDisplay.textContent = '00:00';
  nbToursDisplay.textContent = '0';
  distanceParcourueDisplay.textContent = '0';
  vitesseMoyenneDisplay.textContent = '0';
  vmaEstimeeDisplay.textContent = '0';

  startTimer();
});

plusTourBtn.addEventListener('click', () => {
  nbTours++;
  nbToursDisplay.textContent = nbTours;
  const dist = distanceTour * nbTours;
  distanceParcourueDisplay.textContent = dist.toFixed(1);

  const vitesse = calculerVitesseMoyenne();
  vitesseMoyenneDisplay.textContent = vitesse.toFixed(2);

  const vmaEst = estimerVMA();
  vmaEstimeeDisplay.textContent = vmaEst.toFixed(2);
});

resetBtn.addEventListener('click', resetCourse);

// Au départ, seuls start est actif, autres désactivés
plusTourBtn.disabled = true;
resetBtn.disabled = true;
