// Variables globales
let eleveActif = JSON.parse(sessionStorage.getItem('eleveActif'));
let eleve1 = JSON.parse(sessionStorage.getItem('eleve1'));
let eleve2 = JSON.parse(sessionStorage.getItem('eleve2'));
let dureeMinutes = parseInt(sessionStorage.getItem('dureeCourse'));
let distanceTour = parseFloat(sessionStorage.getItem('distanceTour'));

let tempsRestant = dureeMinutes * 60; // secondes
let timerInterval;
let tours = 0;
let distanceTotale = 0;

// DOM
const timerDisplay = document.getElementById('timer');
const distanceDisplay = document.getElementById('distanceTotale');
const vitesseDisplay = document.getElementById('vitesse');
const vmaDisplay = document.getElementById('vma');
const nomEleve = document.getElementById('nomEleve'); // Ajoute <h3 id="nomEleve"></h3> dans course.html
const plusTourBtn = document.getElementById('plusTour');
const quartBtn = document.getElementById('ajoutQuart');
const demiBtn = document.getElementById('ajoutDemi');
const troisQuartBtn = document.getElementById('ajoutTroisQuart');
const terminerBtn = document.getElementById('terminerCourse');

// Affiche prénom de l'élève actif
nomEleve.textContent = `${eleveActif.prenom} ${eleveActif.nom}`;

// Démarre le minuteur
function startTimer() {
  timerInterval = setInterval(() => {
    tempsRestant--;

    // Affichage temps
    let min = Math.floor(tempsRestant / 60);
    let sec = tempsRestant % 60;
    timerDisplay.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    // Clignotement 10 dernières secondes
    if (tempsRestant <= 10) {
      timerDisplay.classList.toggle('blink');
    }

    // Fin course
    if (tempsRestant <= 0) {
      clearInterval(timerInterval);
      endCourse();
    }
  }, 1000);
}

// Ajout tour
plusTourBtn.addEventListener('click', () => {
  tours++;
  distanceTotale = tours * distanceTour;
  updateStats();
});

// Ajout fraction tours
quartBtn.addEventListener('click', () => {
  distanceTotale += distanceTour * 0.25;
  updateStats();
});
demiBtn.addEventListener('click', () => {
  distanceTotale += distanceTour * 0.5;
  updateStats();
});
troisQuartBtn.addEventListener('click', () => {
  distanceTotale += distanceTour * 0.75;
  updateStats();
});

// Mise à jour stats
function updateStats() {
  distanceDisplay.textContent = `${distanceTotale.toFixed(1)} m`;

  // Vitesse moyenne (km/h) = (distance en m / 1000) / (temps en h)
  let tempsEcoule = dureeMinutes - tempsRestant / 60;
  let vitesseMoyenne = tempsEcoule > 0 ? (distanceTotale / 1000) / (tempsEcoule / 60) : 0;
  vitesseDisplay.textContent = `${vitesseMoyenne.toFixed(2)} km/h`;

  // VMA estimée = vitesse moyenne * 1.05
  let vmaEstimee = vitesseMoyenne * 1.05;
  vmaDisplay.textContent = `${vmaEstimee.toFixed(2)} km/h`;
}

// Terminer manuellement
terminerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  endCourse();
});

// Fin de course
function endCourse() {
  // Sauvegarde stats
  const stats = {
    nom: eleveActif.nom,
    prenom: eleveActif.prenom,
    classe: eleveActif.classe,
    sexe: eleveActif.sexe,
    distance: distanceTotale,
    vitesse: parseFloat(vitesseDisplay.textContent),
    vma: parseFloat(vmaDisplay.textContent)
  };

  if (!sessionStorage.getItem('statsEleve1')) {
    // Stocker stats élève 1
    sessionStorage.setItem('statsEleve1', JSON.stringify(stats));
    // Passer à élève 2
    sessionStorage.setItem('eleveActif', JSON.stringify(eleve2));
    window.location.href = 'course.html'; // Relance pour élève 2
  } else {
    // Stocker stats élève 2
    sessionStorage.setItem('statsEleve2', JSON.stringify(stats));
    // Aller vers le bilan
    window.location.href = 'summary.html';
  }
}

// Lancer au chargement
startTimer();
