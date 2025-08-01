// eleve.js

// Elements
const eleve1Section = document.getElementById('eleve1');
const eleve2Section = document.getElementById('eleve2');

const nom1Input = document.getElementById('nom1');
const prenom1Input = document.getElementById('prenom1');
const classe1Input = document.getElementById('classe1');
const sexe1Select = document.getElementById('sexe1');

const nom2Input = document.getElementById('nom2');
const prenom2Input = document.getElementById('prenom2');
const classe2Input = document.getElementById('classe2');
const sexe2Select = document.getElementById('sexe2');

const dureeInput = document.getElementById('dureeCourse');
const distTourInput = document.getElementById('distanceTour');

const btnStart = document.getElementById('startBtn');
const btnAddTour = document.getElementById('addTourBtn');
const btnReset = document.getElementById('resetBtn');

const info1 = document.getElementById('info1');
const info2 = document.getElementById('info2');

const qrCodeContainer = document.getElementById('qrCodeContainer');

// Variables course
let dureeTotal = 5 * 60; // en secondes (par défaut 5 min)
let distanceTour = 400; // mètres par défaut
let timerInterval = null;
let tempsRestant = dureeTotal;

let tours1 = 0;
let tours2 = 0;

let chronoActif = false;
let eleveCourant = 1; // pour gérer la succession : 1 puis 2

// Fonction formatage temps mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Mise à jour affichage durée modifiable
dureeInput.value = dureeTotal / 60;
distTourInput.value = distanceTour;

// Mise à jour infos affichées
function majInfos() {
  // Calcul distance parcourue
  const dist1 = tours1 * distanceTour;
  const dist2 = tours2 * distanceTour;

  // Calcul vitesse moyenne (distance / temps en h)
  const tempsEcoule = dureeTotal - tempsRestant;
  const vitesse1 = tempsEcoule > 0 ? (dist1 / 1000) / (tempsEcoule / 3600) : 0;
  const vitesse2 = tempsEcoule > 0 ? (dist2 / 1000) / (tempsEcoule / 3600) : 0;

  info1.innerHTML = `
    <strong>Durée coursée :</strong> ${formatTime(tempsEcoule)}<br>
    <strong>Distance :</strong> ${dist1} m<br>
    <strong>Vitesse Moyenne :</strong> ${vitesse1.toFixed(2)} km/h
  `;
  info2.innerHTML = `
    <strong>Durée coursée :</strong> ${formatTime(tempsEcoule)}<br>
    <strong>Distance :</strong> ${dist2} m<br>
    <strong>Vitesse Moyenne :</strong> ${vitesse2.toFixed(2)} km/h
  `;
}

// Reset complet
function resetCourse() {
  clearInterval(timerInterval);
  tempsRestant = dureeTotal;
  tours1 = 0;
  tours2 = 0;
  chronoActif = false;
  eleveCourant = 1;
  btnStart.textContent = "Démarrer le chrono";
  btnAddTour.disabled = true;
  btnReset.disabled = true;
  majInfos();
  qrCodeContainer.innerHTML = '';
  afficherTempsRestant();
}

// Affiche temps restant
function afficherTempsRestant() {
  if (eleveCourant === 1) {
    eleve1Section.querySelector('.tempsRestant').textContent = formatTime(tempsRestant);
    eleve2Section.querySelector('.tempsRestant').textContent = "--:--";
  } else {
    eleve2Section.querySelector('.tempsRestant').textContent = formatTime(tempsRestant);
    eleve1Section.querySelector('.tempsRestant').textContent = "--:--";
  }
}

// Lancement du chrono
function startChrono() {
  if (chronoActif) return; // déjà actif

  // Si modification inputs, mettre à jour valeurs
  dureeTotal = parseInt(dureeInput.value, 10) * 60;
  if (isNaN(dureeTotal) || dureeTotal <= 0) {
    alert("Durée invalide");
    return;
  }
  distanceTour = parseInt(distTourInput.value, 10);
  if (isNaN(distanceTour) || distanceTour <= 0) {
    alert("Distance tour invalide");
    return;
  }

  // Initialisation tempsRestant
  tempsRestant = dureeTotal;
  tours1 = 0;
  tours2 = 0;
  eleveCourant = 1;
  chronoActif = true;

  btnStart.textContent = "Course en cours...";
  btnStart.disabled = true;
  btnAddTour.disabled = false;
  btnReset.disabled = false;

  afficherTempsRestant();
  majInfos();

  timerInterval = setInterval(() => {
    tempsRestant--;
    if (tempsRestant < 0) {
      clearInterval(timerInterval);

      // Si eleve 1 terminé, passer à eleve 2
      if (eleveCourant === 1) {
        eleveCourant = 2;
        tempsRestant = dureeTotal;
        btnStart.textContent = "Course Élève 2 en cours...";
        btnAddTour.disabled = false;
        afficherTempsRestant();
        majInfos();
        timerInterval = setInterval(() => {
          tempsRestant--;
          afficherTempsRestant();
          majInfos();
          if (tempsRestant < 0) {
            clearInterval(timerInterval);
            chronoActif = false;
            btnStart.textContent = "Terminé";
            btnStart.disabled = true;
            btnAddTour.disabled = true;

            genererQrCode();
          }
        }, 1000);
      }
    } else {
      afficherTempsRestant();
      majInfos();
    }
  }, 1000);
}

// Ajouter un tour
function ajouterTour() {
  if (!chronoActif) return;

  if (eleveCourant === 1) {
    tours1++;
  } else {
    tours2++;
  }
  majInfos();
}

// Génération QR code avec infos des deux élèves
function genererQrCode() {
  const data = {
    eleve1: {
      nom: nom1Input.value.trim(),
      prenom: prenom1Input.value.trim(),
      classe: classe1Input.value.trim(),
      sexe: sexe1Select.value,
      tours: tours1,
      distance: tours1 * distanceTour,
      duree: dureeTotal,
    },
    eleve2: {
      nom: nom2Input.value.trim(),
      prenom: prenom2Input.value.trim(),
      classe: classe2Input.value.trim(),
      sexe: sexe2Select.value,
      tours: tours2,
      distance: tours2 * distanceTour,
      duree: dureeTotal,
    }
  };

  qrCodeContainer.innerHTML = '';
  new QRCode(qrCodeContainer, {
    text: JSON.stringify(data),
    width: 180,
    height: 180,
  });
}

// Evenements
btnStart.addEventListener('click', startChrono);
btnAddTour.addEventListener('click', ajouterTour);
btnReset.addEventListener('click', resetCourse);

// Initialisation au chargement
resetCourse();
