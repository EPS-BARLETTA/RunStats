// eleve.js

// Données des deux élèves
let eleve1 = {
  nom: '',
  prenom: '',
  classe: '',
  sexe: '',
  tours: 0,
  distanceTour: 0, // en mètres
  tempsTotal: 0,   // en secondes
  vitesseMoyenne: 0,
  chronoStart: null,
  chronoInterval: null,
};

let eleve2 = {
  nom: '',
  prenom: '',
  classe: '',
  sexe: '',
  tours: 0,
  distanceTour: 0,
  tempsTotal: 0,
  vitesseMoyenne: 0,
  chronoStart: null,
  chronoInterval: null,
};

// Qui court ? 1 ou 2
let eleveActif = 1;

// Paramètres course (modifiables)
let dureeCourse = 5;      // en minutes (modifiable via input)
let distanceTour = 400;   // en mètres (modifiable via input)

// Lancement de la course (bouton démarrer)
function demarrerCourse() {
  if (!validerInfos()) return;

  // Init élèves
  eleve1.tours = 0;
  eleve1.tempsTotal = 0;
  eleve1.vitesseMoyenne = 0;
  eleve1.chronoInterval = null;

  eleve2.tours = 0;
  eleve2.tempsTotal = 0;
  eleve2.vitesseMoyenne = 0;
  eleve2.chronoInterval = null;

  eleveActif = 1;
  demarrerChrono();
}

// Validation des infos élèves et paramètres
function validerInfos() {
  // Récupérer les infos depuis les inputs HTML
  eleve1.nom = document.getElementById('eleve1_nom').value.trim();
  eleve1.prenom = document.getElementById('eleve1_prenom').value.trim();
  eleve1.classe = document.getElementById('eleve1_classe').value.trim();
  eleve1.sexe = document.getElementById('eleve1_sexe').value;

  eleve2.nom = document.getElementById('eleve2_nom').value.trim();
  eleve2.prenom = document.getElementById('eleve2_prenom').value.trim();
  eleve2.classe = document.getElementById('eleve2_classe').value.trim();
  eleve2.sexe = document.getElementById('eleve2_sexe').value;

  // Récup durée et distance modifiables
  const dureeInput = document.getElementById('duree_course').value.trim();
  const distanceInput = document.getElementById('distance_tour').value.trim();

  if (!eleve1.nom || !eleve1.prenom || !eleve1.sexe || !eleve1.classe) {
    alert("Merci de remplir toutes les informations pour l'élève 1");
    return false;
  }
  if (!eleve2.nom || !eleve2.prenom || !eleve2.sexe || !eleve2.classe) {
    alert("Merci de remplir toutes les informations pour l'élève 2");
    return false;
  }

  // Durée et distance vérification
  dureeCourse = parseInt(dureeInput);
  distanceTour = parseInt(distanceInput);

  if (isNaN(dureeCourse) || dureeCourse <= 0) {
    alert("Merci d'indiquer une durée de course valide (minutes)");
    return false;
  }
  if (isNaN(distanceTour) || distanceTour <= 0) {
    alert("Merci d'indiquer une distance de tour valide (en mètres)");
    return false;
  }

  // Affecter distanceTour aux élèves
  eleve1.distanceTour = distanceTour;
  eleve2.distanceTour = distanceTour;

  return true;
}

// Démarrer chrono élève actif
function demarrerChrono() {
  let eleve = eleveActif === 1 ? eleve1 : eleve2;

  if (eleve.chronoInterval) return; // déjà lancé

  eleve.chronoStart = Date.now() - eleve.tempsTotal * 1000;
  eleve.chronoInterval = setInterval(() => {
    eleve.tempsTotal = (Date.now() - eleve.chronoStart) / 1000;
    mettreAJourAffichage();

    if (eleve.tempsTotal >= dureeCourse * 60) {
      arreterChrono();
      passerEleveSuivant();
    }
  }, 500);
}

// Arrêter chrono élève actif
function arreterChrono() {
  let eleve = eleveActif === 1 ? eleve1 : eleve2;
  if (eleve.chronoInterval) {
    clearInterval(eleve.chronoInterval);
    eleve.chronoInterval = null;
  }
  calculerVitesse(eleve);
  mettreAJourAffichage();
}

// Passer au second élève ou terminer
function passerEleveSuivant() {
  if (eleveActif === 1) {
    eleveActif = 2;
    alert("Course élève 1 terminée. C'est au tour de l'élève 2 !");
    demarrerChrono();
  } else {
    alert("Courses terminées !");
    genererQRCode();
  }
}

// Ajouter un tour (bouton + tour)
function ajouterTour() {
  let eleve = eleveActif === 1 ? eleve1 : eleve2;
  if (eleve.tempsTotal === 0) {
    alert("Démarrez le chrono avant d'ajouter un tour.");
    return;
  }
  eleve.tours++;
  calculerVitesse(eleve);
  mettreAJourAffichage();
}

// Calculer vitesse moyenne m/s
function calculerVitesse(eleve) {
  if (eleve.tempsTotal > 0) {
    eleve.vitesseMoyenne = (eleve.tours * eleve.distanceTour) / eleve.tempsTotal;
  } else {
    eleve.vitesseMoyenne = 0;
  }
}

// Met à jour l'affichage sur la page (adapter ids HTML)
function mettreAJourAffichage() {
  // Élève 1
  document.getElementById('eleve1_temps').textContent = formatTemps(eleve1.tempsTotal);
  document.getElementById('eleve1_tours').textContent = eleve1.tours;
  document.getElementById('eleve1_distance').textContent = (eleve1.tours * eleve1.distanceTour).toFixed(0);
  document.getElementById('eleve1_vitesse').textContent = (eleve1.vitesseMoyenne * 3.6).toFixed(2);

  // Élève 2
  document.getElementById('eleve2_temps').textContent = formatTemps(eleve2.tempsTotal);
  document.getElementById('eleve2_tours').textContent = eleve2.tours;
  document.getElementById('eleve2_distance').textContent = (eleve2.tours * eleve2.distanceTour).toFixed(0);
  document.getElementById('eleve2_vitesse').textContent = (eleve2.vitesseMoyenne * 3.6).toFixed(2);
}

// Format temps en mm:ss
function formatTemps(tps) {
  let min = Math.floor(tps / 60);
  let sec = Math.floor(tps % 60);
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

// Générer QR Code avec les infos des deux élèves
function genererQRCode() {
  const data = {
    eleve1: {
      nom: eleve1.nom,
      prenom: eleve1.prenom,
      classe: eleve1.classe,
      sexe: eleve1.sexe,
      tours: eleve1.tours,
      distance: (eleve1.tours * eleve1.distanceTour).toFixed(0),
      vitesse_kmh: (eleve1.vitesseMoyenne * 3.6).toFixed(2),
    },
    eleve2: {
      nom: eleve2.nom,
      prenom: eleve2.prenom,
      classe: eleve2.classe,
      sexe: eleve2.sexe,
      tours: eleve2.tours,
      distance: (eleve2.tours * eleve2.distanceTour).toFixed(0),
      vitesse_kmh: (eleve2.vitesseMoyenne * 3.6).toFixed(2),
    }
  };

  const qrDiv = document.getElementById('qrcode');
  qrDiv.innerHTML = '';

  new QRCode(qrDiv, {
    text: JSON.stringify(data),
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Reset total (optionnel)
function resetCourse() {
  eleve1.tours = 0;
  eleve1.tempsTotal = 0;
  eleve1.vitesseMoyenne = 0;
  eleve1.chronoInterval = null;

  eleve2.tours = 0;
  eleve2.tempsTotal = 0;
  eleve2.vitesseMoyenne = 0;
  eleve2.chronoInterval = null;

  eleveActif = 1;
  mettreAJourAffichage();
  document.getElementById('qrcode').innerHTML = '';
}
