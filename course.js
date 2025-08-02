// Récupération des éléments DOM
const timerCircle = document.getElementById('timerCircle');
const addTourBtn = document.getElementById('addTourBtn');
const finishCourseBtn = document.getElementById('finishCourseBtn');

const distTotalElem = document.getElementById('distanceTotal');
const vitesseMoyElem = document.getElementById('vitesseMoy');
const vmaEstimeElem = document.getElementById('vmaEstime');

const quartTourBtn = document.getElementById('quartTourBtn');
const demiTourBtn = document.getElementById('demiTourBtn');
const troisQuartTourBtn = document.getElementById('troisQuartTourBtn');

const eleveNom = document.getElementById('eleveNom');

// Variables course
let duree = parseInt(document.getElementById('duree').value, 10) || 10; // minutes
let distanceTour = parseFloat(document.getElementById('distance').value) || 400; // mètres
let vmaOptionnelle = parseFloat(document.getElementById('vma').value) || null;

let totalTours = 0;
let fractionTours = 0; // fraction à ajouter en fin
let secondesRestantes = duree * 60;

let timerInterval = null;

// Affiche le prénom dans le header
function afficherNomEleve() {
  let nomPrenom = eleveNom.textContent || "Élève";
  document.querySelector('header h1').textContent = `Course : ${nomPrenom}`;
}

// Formatage du timer en mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Mise à jour du timer visuel
function majTimer() {
  timerCircle.textContent = formatTime(secondesRestantes);

  // Clignotement sur 10 dernières secondes
  if (secondesRestantes <= 10) {
    timerCircle.classList.add('blink');
  } else {
    timerCircle.classList.remove('blink');
  }
}

// Calculs des stats
function majStats() {
  const distanceParcourue = (totalTours + fractionTours) * distanceTour; // en mètres
  distTotalElem.textContent = (distanceParcourue / 1000).toFixed(2); // km

  const tempsHeures = duree / 60; // durée en heures (minutes converties)
  const vitesseMoy = distanceParcourue / 1000 / tempsHeures; // km/h
  vitesseMoyElem.textContent = vitesseMoy.toFixed(2);

  // VMA estimée : vitesse max atteinte (si on suppose que vitesse moyenne = 0.9 * VMA)
  // Ou si vmaOptionnelle est renseignée on l'utilise pour estimation
  let vmaEstime = vmaOptionnelle || (vitesseMoy / 0.9);
  vmaEstimeElem.textContent = vmaEstime.toFixed(2);
}

// Démarrer le minuteur
function startTimer() {
  afficherNomEleve();
  majTimer();
  majStats();

  timerInterval = setInterval(() => {
    secondesRestantes--;
    majTimer();

    if (secondesRestantes <= 0) {
      clearInterval(timerInterval);
      alert("Fin de la course !");
      // Activation bouton fin course
      finishCourseBtn.disabled = false;
      addTourBtn.disabled = true;
      quartTourBtn.disabled = false;
      demiTourBtn.disabled = false;
      troisQuartTourBtn.disabled = false;
    }
  }, 1000);
}

// Ajouter un tour complet
function ajouterTour() {
  totalTours++;
  majStats();
}

// Ajouter fraction de tour en fin de course
function ajouterFraction(fraction) {
  fractionTours += fraction;
  // Empêche de dépasser 1 tour total (logique basique)
  if (fractionTours > 0.99) {
    fractionTours = 0.99;
  }
  majStats();
  // Une fois ajouté, désactive les boutons fraction
  quartTourBtn.disabled = true;
  demiTourBtn.disabled = true;
  troisQuartTourBtn.disabled = true;
}

// Fin de la course : préparer transfert données, etc.
function finirCourse() {
  // Construire les données à transmettre ou stocker (localStorage/sessionStorage)
  const eleveData = {
    nomPrenom: eleveNom.textContent,
    duree,
    distanceParcourue: ((totalTours + fractionTours) * distanceTour),
    vitesseMoyenne: parseFloat(vitesseMoyElem.textContent),
    vmaEstimee: parseFloat(vmaEstimeElem.textContent)
  };
  // Sauvegarder dans sessionStorage pour la page suivante
  sessionStorage.setItem('eleveCourse', JSON.stringify(eleveData));
  
  // Redirection vers la page suivante, par exemple résumé
  window.location.href = 'summary.html';
}

// Événements
addTourBtn.addEventListener('click', ajouterTour);
finishCourseBtn.addEventListener('click', finirCourse);

quartTourBtn.addEventListener('click', () => ajouterFraction(0.25));
demiTourBtn.addEventListener('click', () => ajouterFraction(0.5));
troisQuartTourBtn.addEventListener('click', () => ajouterFraction(0.75));

// Initialisation bouton fin course désactivé au départ
finishCourseBtn.disabled = true;

// Démarrage automatique du timer au chargement de la page (peut être modifié)
window.addEventListener('load', () => {
  // Charger valeurs du formulaire au cas où
  duree = parseInt(document.getElementById('duree').value, 10) || 10;
  distanceTour = parseFloat(document.getElementById('distance').value) || 400;
  vmaOptionnelle = parseFloat(document.getElementById('vma').value) || null;
  
  secondesRestantes = duree * 60;
  startTimer();
});
