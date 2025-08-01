// eleve.js

// Variables pour chrono et tours
let dureeCourse = 0;  // en secondes (converti depuis minutes)
let distanceTour = 0; // en mètres

let timer = null;
let tempsRestant = 0;

const eleve1 = {
  nom: '', prenom: '', classe: '', sexe: '',
  tours: 0,
  distanceTotale: 0,
  vitesseMoyenne: 0, // m/s
};
const eleve2 = {
  nom: '', prenom: '', classe: '', sexe: '',
  tours: 0,
  distanceTotale: 0,
  vitesseMoyenne: 0,
};

const startBtn = document.getElementById('startBtn');
const addTourBtn = document.getElementById('addTourBtn');
const resetBtn = document.getElementById('resetBtn');
const resultatsDiv = document.getElementById('resultatsCourse');

function validerChamps() {
  eleve1.nom = document.getElementById('nom1').value.trim();
  eleve1.prenom = document.getElementById('prenom1').value.trim();
  eleve1.classe = document.getElementById('classe1').value.trim();
  eleve1.sexe = document.getElementById('sexe1').value;

  eleve2.nom = document.getElementById('nom2').value.trim();
  eleve2.prenom = document.getElementById('prenom2').value.trim();
  eleve2.classe = document.getElementById('classe2').value.trim();
  eleve2.sexe = document.getElementById('sexe2').value;

  dureeCourse = parseInt(document.getElementById('dureeCourse').value) * 60;
  distanceTour = parseInt(document.getElementById('distanceTour').value);

  if (!eleve1.nom || !eleve1.prenom || !eleve1.classe || !eleve1.sexe) {
    alert('Veuillez renseigner toutes les informations pour l\'élève 1.');
    return false;
  }
  if (!eleve2.nom || !eleve2.prenom || !eleve2.classe || !eleve2.sexe) {
    alert('Veuillez renseigner toutes les informations pour l\'élève 2.');
    return false;
  }
  if (!dureeCourse || !distanceTour) {
    alert('Veuillez renseigner la durée de la course et la distance du tour.');
    return false;
  }
  return true;
}

function afficherResultats() {
  const dureeMin = (dureeCourse / 60).toFixed(1);
  const eleve1Vitesse = eleve1.vitesseMoyenne ? (eleve1.vitesseMoyenne * 3.6).toFixed(2) : '0.00'; // km/h
  const eleve2Vitesse = eleve2.vitesseMoyenne ? (eleve2.vitesseMoyenne * 3.6).toFixed(2) : '0.00';

  resultatsDiv.innerHTML = `
    <h3>Résultats de la course (${dureeMin} minutes)</h3>
    <div style="display:flex; justify-content:space-around;">
      <div style="border:1px solid #ccc; padding:10px; width:45%; background:#d0e7ff;">
        <strong>${eleve1.nom} ${eleve1.prenom} (${eleve1.sexe})</strong><br>
        Tours : ${eleve1.tours}<br>
        Distance parcourue : ${eleve1.distanceTotale} m<br>
        Vitesse moyenne : ${eleve1Vitesse} km/h
      </div>
      <div style="border:1px solid #ccc; padding:10px; width:45%; background:#d0f0d6;">
        <strong>${eleve2.nom} ${eleve2.prenom} (${eleve2.sexe})</strong><br>
        Tours : ${eleve2.tours}<br>
        Distance parcourue : ${eleve2.distanceTotale} m<br>
        Vitesse moyenne : ${eleve2Vitesse} km/h
      </div>
    </div>
  `;
}

function miseAJourVitesse(ele) {
  if (tempsRestant > 0) {
    // vitesse moyenne = distance / temps en m/s
    const tempsEcoule = dureeCourse - tempsRestant; // secondes
    ele.vitesseMoyenne = ele.tours * distanceTour / (tempsEcoule || 1);
  }
}

function startTimer() {
  if (!validerChamps()) return;

  startBtn.disabled = true;
  addTourBtn.disabled = false;
  resetBtn.disabled = false;

  tempsRestant = dureeCourse;
  eleve1.tours = 0;
  eleve2.tours = 0;
  eleve1.distanceTotale = 0;
  eleve2.distanceTotale = 0;
  eleve1.vitesseMoyenne = 0;
  eleve2.vitesseMoyenne = 0;
  afficherResultats();

  timer = setInterval(() => {
    tempsRestant--;
    if (tempsRestant <= 0) {
      clearInterval(timer);
      startBtn.disabled = false;
      addTourBtn.disabled = true;
      alert('Fin de la course !');
      genererQRCode();
    }
  }, 1000);
}

function ajouterTour() {
  // Ajoute un tour aux deux élèves (ou tu peux adapter si courses successives)
  eleve1.tours++;
  eleve1.distanceTotale = eleve1.tours * distanceTour;
  miseAJourVitesse(eleve1);

  eleve2.tours++;
  eleve2.distanceTotale = eleve2.tours * distanceTour;
  miseAJourVitesse(eleve2);

  afficherResultats();
}

function resetCourse() {
  clearInterval(timer);
  tempsRestant = 0;
  startBtn.disabled = false;
  addTourBtn.disabled = true;
  resetBtn.disabled = true;

  eleve1.tours = 0;
  eleve2.tours = 0;
  eleve1.distanceTotale = 0;
  eleve2.distanceTotale = 0;
  eleve1.vitesseMoyenne = 0;
  eleve2.vitesseMoyenne = 0;

  resultatsDiv.innerHTML = '';
}

function genererQRCode() {
  // Pour l'exemple, juste afficher un JSON textuel avec les données des deux élèves
  const data = {
    eleve1: {
      nom: eleve1.nom,
      prenom: eleve1.prenom,
      classe: eleve1.classe,
      sexe: eleve1.sexe,
      tours: eleve1.tours,
      distance: eleve1.distanceTotale,
      vitesseMoyenne_kmh: (eleve1.vitesseMoyenne * 3.6).toFixed(2),
    },
    eleve2: {
      nom: eleve2.nom,
      prenom: eleve2.prenom,
      classe: eleve2.classe,
      sexe: eleve2.sexe,
      tours: eleve2.tours,
      distance: eleve2.distanceTotale,
      vitesseMoyenne_kmh: (eleve2.vitesseMoyenne * 3.6).toFixed(2),
    },
  };

  alert("QR Code généré (exemple JSON) :\n" + JSON.stringify(data, null, 2));
}

addTourBtn.disabled = true;
resetBtn.disabled = true;

startBtn.addEventListener('click', startTimer);
addTourBtn.addEventListener('click', ajouterTour);
resetBtn.addEventListener('click', resetCourse);
