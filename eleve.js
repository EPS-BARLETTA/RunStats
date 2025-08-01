// eleve.js

// Données
let currentCourse = 1;
let toursEleve1 = 0;
let toursEleve2 = 0;
let dureeCourse = 0;
let distanceTour = 0;
let tempsRestant = 0;
let timerInterval = null;

const eleve1Data = {};
const eleve2Data = {};

// Récupération éléments DOM
const minuteurEl = document.getElementById('minuteur');
const minuteurContainer = document.getElementById('minuteur-container');
const boutonsCourse = document.querySelector('.boutons-course');
const parametresCourse = document.querySelector('.parametres-course');
const elevesContainer = document.querySelector('.eleves-container');
const infosCourse = document.querySelector('.infos-course');
const qrContainer = document.getElementById('qrCode-container');

// Boutons
const startBtn = document.getElementById('startBtn');
const tourBtn = document.getElementById('tourBtn');
const resetBtn = document.getElementById('resetBtn');

// Vérifier infos saisies
function infosValides() {
  const nom1 = document.getElementById('nom1').value.trim();
  const prenom1 = document.getElementById('prenom1').value.trim();
  const sexe1 = document.getElementById('sexe1').value;
  const classe1 = document.getElementById('classe1').value.trim();

  const nom2 = document.getElementById('nom2').value.trim();
  const prenom2 = document.getElementById('prenom2').value.trim();
  const sexe2 = document.getElementById('sexe2').value;
  const classe2 = document.getElementById('classe2').value.trim();

  const duree = document.getElementById('dureeCourse').value;
  const distance = document.getElementById('distanceTour').value;

  return (
    nom1 && prenom1 && sexe1 !== 'choisir' && classe1 &&
    nom2 && prenom2 && sexe2 !== 'choisir' && classe2 &&
    duree > 0 && distance > 0
  );
}

// Démarrage course
startBtn.addEventListener('click', () => {
  if (!infosValides()) {
    alert('Veuillez saisir toutes les informations avant de démarrer la course.');
    return;
  }

  if (currentCourse === 1) {
    setInfosEleve1();
  } else {
    setInfosEleve2();
  }

  // Cacher les saisies
  elevesContainer.style.display = 'none';
  parametresCourse.style.display = 'none';

  // Préparer minuteur
  dureeCourse = parseInt(document.getElementById('dureeCourse').value) * 60;
  distanceTour = parseFloat(document.getElementById('distanceTour').value);
  tempsRestant = dureeCourse;

  afficherMinuteur();
  minuteurContainer.classList.remove('hidden');

  // Démarrer chrono
  timerInterval = setInterval(() => {
    tempsRestant--;
    afficherMinuteur();

    if (tempsRestant <= 10) {
      minuteurEl.classList.add('clignote');
    }

    if (tempsRestant <= 0) {
      clearInterval(timerInterval);
      minuteurEl.classList.remove('clignote');
      finCourse();
    }
  }, 1000);
});

// Bouton + Tour
tourBtn.addEventListener('click', () => {
  if (currentCourse === 1) {
    toursEleve1++;
  } else {
    toursEleve2++;
  }
  majInfosCourse();
});

// Reset
resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  toursEleve1 = 0;
  toursEleve2 = 0;
  currentCourse = 1;
  minuteurEl.textContent = "00:00";
  elevesContainer.style.display = 'flex';
  parametresCourse.style.display = 'block';
  infosCourse.innerHTML = '';
  qrContainer.classList.add('hidden');
});

// Affichage minuteur
function afficherMinuteur() {
  const minutes = Math.floor(tempsRestant / 60);
  const secondes = tempsRestant % 60;
  minuteurEl.textContent = `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;
}

// Fin de course
function finCourse() {
  if (currentCourse === 1) {
    alert('Course 1 terminée. Cliquez sur "Démarrer" pour lancer la course 2.');
    currentCourse = 2;
    elevesContainer.style.display = 'flex';
    parametresCourse.style.display = 'block';
  } else {
    alert('Course 2 terminée. QR Code généré !');
    genererQRCode();
  }
}

// Stocker infos élève
function setInfosEleve1() {
  eleve1Data.nom = document.getElementById('nom1').value;
  eleve1Data.prenom = document.getElementById('prenom1').value;
  eleve1Data.classe = document.getElementById('classe1').value;
  eleve1Data.sexe = document.getElementById('sexe1').value;
}

function setInfosEleve2() {
  eleve2Data.nom = document.getElementById('nom2').value;
  eleve2Data.prenom = document.getElementById('prenom2').value;
  eleve2Data.classe = document.getElementById('classe2').value;
  eleve2Data.sexe = document.getElementById('sexe2').value;
}

// Mise à jour infos course
function majInfosCourse() {
  let distance1 = toursEleve1 * distanceTour;
  let distance2 = toursEleve2 * distanceTour;

  let vitesse1 = (distance1 / (dureeCourse / 3600)).toFixed(2); // km/h
  let vitesse2 = (distance2 / (dureeCourse / 3600)).toFixed(2);

  infosCourse.innerHTML = `
    <div class="resultats">
      <h4>${eleve1Data.prenom || 'Élève 1'} :</h4>
      <p>Tours : ${toursEleve1}</p>
      <p>Distance : ${distance1.toFixed(2)} m</p>
      <p>Vitesse Moyenne : ${vitesse1} km/h</p>
    </div>
    <div class="resultats">
      <h4>${eleve2Data.prenom || 'Élève 2'} :</h4>
      <p>Tours : ${toursEleve2}</p>
      <p>Distance : ${distance2.toFixed(2)} m</p>
      <p>Vitesse Moyenne : ${vitesse2} km/h</p>
    </div>
  `;
}

// Générer QR Code
function genererQRCode() {
  qrContainer.innerHTML = '';

  const data = {
    eleve1: {
      ...eleve1Data,
      tours: toursEleve1,
      distance: toursEleve1 * distanceTour
    },
    eleve2: {
      ...eleve2Data,
      tours: toursEleve2,
      distance: toursEleve2 * distanceTour
    }
  };

  const qr = new QRCode(qrContainer, {
    text: JSON.stringify(data),
    width: 180,
    height: 180
  });

  qrContainer.classList.remove('hidden');
}
