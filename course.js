// course.js

// Données reçues via sessionStorage (élément à améliorer côté eleve.html)
const elevesData = JSON.parse(sessionStorage.getItem('elevesData') || '{}');
/*
Format attendu : {
  eleve1: { prenom: "Alice", distanceTour: 400, vma: optional number },
  eleve2: { prenom: "Bob", distanceTour: 400, vma: optional number }
}
*/

// Variables globales
let eleveActuel = 1; // 1 ou 2
let timerId = null;
let dureeCourse = 0; // en secondes
let distanceTour = 0; // en mètres
let toursEffectues = 0;
let vitesseMoyenne = 0; // km/h
let vmaEstimee = null; // km/h
let totalDistance = 0; // m
let tempsDepart = null;
let tempsFin = null;

const pageSubTitle = document.getElementById('pageSubTitle');
const timerCircle = document.getElementById('timerCircle');
const boutonPlusTour = document.getElementById('boutonPlusTour');
const distanceTotaleSpan = document.getElementById('distanceTotale');
const vitesseMoyenneSpan = document.getElementById('vitesseMoyenne');
const vmaEstimeeSpan = document.getElementById('vmaEstimee');
const finCourseOptions = document.getElementById('finCourseOptions');
const btnFinCourse = document.getElementById('btnFinCourse');
const btnLancerCourse2 = document.getElementById('btnLancerCourse2');
const btnFinTout = document.getElementById('btnFinTout');

const radiosFraction = document.getElementsByName('fractionTour');


// Initialisation page
function initPage() {
  // Choix de l'élève 1 ou 2 selon eleveActuel
  const eleve = eleveActuel === 1 ? elevesData.eleve1 : elevesData.eleve2;
  if (!eleve) {
    alert('Données élève manquantes.');
    return;
  }
  // On récupère la distance tour pour l'élève (400m par défaut)
  distanceTour = eleve.distanceTour || 400;
  // VMA (optionnel)
  vmaEstimee = eleve.vma || null;

  // Mise à jour sous-titre avec prénom élève
  pageSubTitle.textContent = `Course - ${eleve.prenom}`;

  // Reset affichages
  toursEffectues = 0;
  totalDistance = 0;
  vitesseMoyenne = 0;
  tempsDepart = null;
  tempsFin = null;
  timerCircle.textContent = '00:00';
  timerCircle.classList.remove('blink');
  distanceTotaleSpan.textContent = '0.00 m';
  vitesseMoyenneSpan.textContent = '0.00 km/h';
  vmaEstimeeSpan.textContent = vmaEstimee ? `${vmaEstimee.toFixed(2)} km/h` : '-- km/h';

  finCourseOptions.style.display = 'none';
  btnFinCourse.style.display = 'inline-block';
  btnLancerCourse2.style.display = 'none';
  btnFinTout.style.display = 'none';
  boutonPlusTour.disabled = false;
}

// Timer affichage mm:ss
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

// Compte à rebours
function demarrerTimer(dureeSec) {
  dureeCourse = dureeSec;
  let tempsRestant = dureeSec;

  timerCircle.textContent = formatTime(tempsRestant);
  timerCircle.classList.remove('blink');

  tempsDepart = Date.now();

  timerId = setInterval(() => {
    tempsRestant--;
    timerCircle.textContent = formatTime(tempsRestant);

    // Clignotement pour les 10 dernières secondes
    if (tempsRestant <= 10) {
      timerCircle.classList.add('blink');
    } else {
      timerCircle.classList.remove('blink');
    }

    if (tempsRestant <= 0) {
      clearInterval(timerId);
      timerCircle.classList.remove('blink');
      terminerCourse();
    }
  }, 1000);
}

// Ajouter un tour
function ajouterTour() {
  toursEffectues++;
  totalDistance = toursEffectues * distanceTour;
  distanceTotaleSpan.textContent = `${totalDistance.toFixed(2)} m`;

  // Recalcul vitesse moyenne = distance / temps écoulé en h
  const tempsEcouleS = (Date.now() - tempsDepart) / 1000;
  const tempsEcouleH = tempsEcouleS / 3600;
  vitesseMoyenne = totalDistance / 1000 / tempsEcouleH;
  vitesseMoyenneSpan.textContent = vitesseMoyenne.toFixed(2) + ' km/h';

  // Mise à jour estimation VMA si non fournie
  if (!vmaEstimee) {
    vmaEstimee = vitesseMoyenne;
    vmaEstimeeSpan.textContent = `${vmaEstimee.toFixed(2)} km/h`;
  }
}

// Fin de course
function terminerCourse() {
  tempsFin = Date.now();
  boutonPlusTour.disabled = true;
  finCourseOptions.style.display = 'flex';
  btnFinCourse.style.display = 'inline-block';
}

// Validation fin de course (ajout fraction tour)
btnFinCourse.addEventListener('click', () => {
  let fractionChoisie = 0;
  for (const radio of radiosFraction) {
    if (radio.checked) {
      fractionChoisie = parseFloat(radio.value);
      break;
    }
  }
  totalDistance += fractionChoisie * distanceTour;
  distanceTotaleSpan.textContent = `${totalDistance.toFixed(2)} m`;

  // Après validation, on affiche le bouton suivant
  finCourseOptions.style.display = 'none';
  btnFinCourse.style.display = 'none';

  if (eleveActuel === 1) {
    btnLancerCourse2.style.display = 'inline-block';
  } else {
    btnFinTout.style.display = 'inline-block';
  }
});

// Bouton + Tour
boutonPlusTour.addEventListener('click', () => {
  if (!tempsDepart) return alert("La course n'a pas démarré !");
  ajouterTour();
});

// Bouton lancer course 2
btnLancerCourse2.addEventListener('click', () => {
  eleveActuel = 2;
  initPage();
  demarrerTimer(dureeCourse);
});

// Bouton finir tout et passer à zone téléchargement
btnFinTout.addEventListener('click', () => {
  // Sauvegarder les données des 2 courses dans sessionStorage pour page suivante
  const course1 = {
    prenom: elevesData.eleve1.prenom,
    distance: totalDistance, 
    duree: (tempsFin - tempsDepart) / 1000,
    vitesseMoyenne,
    vmaEstimee
  };
  const course2 = {
    prenom: elevesData.eleve2.prenom,
    // TODO: récupérer distance et vitesse course 2 de manière correcte (ici simplifié)
    distance: window.course2Distance || 0,
    duree: window.course2Duree || 0,
    vitesseMoyenne: window.course2Vitesse || 0,
    vmaEstimee: elevesData.eleve2.vma || 0,
  };

  sessionStorage.setItem('resultatsCourses', JSON.stringify({ course1, course2 }));
  window.location.href = 'bilan.html';
});

// Lancement automatique à l'ouverture : demander durée course à l'utilisateur
window.addEventListener('load', () => {
  if (!elevesData.eleve1) {
    alert("Les données de l'élève 1 sont manquantes.");
    return;
  }
  initPage();
  // Demander la durée (en minutes) à l'enseignant
  let dureeMin = prompt(`Entrez la durée de la course (en minutes) pour ${elevesData.eleve1.prenom} :`, '5');
  dureeMin = Number(dureeMin);
  if (isNaN(dureeMin) || dureeMin <= 0) {
    alert('Durée invalide, valeur par défaut 5 minutes utilisée.');
    dureeMin = 5;
  }
  demarrerTimer(dureeMin * 60);
});
