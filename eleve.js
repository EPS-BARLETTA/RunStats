// eleve.js

// Variables globales
let currentEleve = 1;
let duration = 0; // en secondes
let distanceTour = 0; // en mètres
let vmaConnue = 0; // en km/h ou 0 si non renseignée

let timer = null;
let timeLeft = 0; // en secondes
let nbTours = 0;

const timerEl = document.getElementById('timer');
const nbToursEl = document.getElementById('nbTours');
const distanceParcourueEl = document.getElementById('distanceParcourue');
const vitesseMoyenneEl = document.getElementById('vitesseMoyenne');
const vmaEstimeeEl = document.getElementById('vmaEstimee');
const startBtn = document.getElementById('startBtn');
const plusTourBtn = document.getElementById('plusTourBtn');
const resetBtn = document.getElementById('resetBtn');
const courseInputs = document.getElementById('courseInputs');
const courseSection = document.getElementById('courseSection');
const inputSection = document.getElementById('inputSection');

let eleveData = {
  1: { nom: '', prenom: '', classe: '', sexe: '', distanceParcourue: 0, vmaEstimee: 0 },
  2: { nom: '', prenom: '', classe: '', sexe: '', distanceParcourue: 0, vmaEstimee: 0 }
};

function afficherTemps(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function majAffichage() {
  timerEl.textContent = afficherTemps(timeLeft);
  nbToursEl.textContent = nbTours;
  const dist = (nbTours * distanceTour).toFixed(1);
  distanceParcourueEl.textContent = dist;

  // Vitesse moyenne km/h = (distance en km) / (temps en h)
  const tempsHeures = (duration - timeLeft) / 3600;
  let vitesse = tempsHeures > 0 ? dist/1000 / tempsHeures : 0;
  vitesseMoyenneEl.textContent = vitesse.toFixed(2);

  // Estimation VMA : ici on fait simple, on prend la vitesse moyenne si > VMA connue, sinon on garde VMA connue
  if (vmaConnue > 0) {
    eleveData[currentEleve].vmaEstimee = Math.max(vitesse, vmaConnue);
  } else {
    eleveData[currentEleve].vmaEstimee = vitesse;
  }
  vmaEstimeeEl.textContent = eleveData[currentEleve].vmaEstimee.toFixed(2);
  
  eleveData[currentEleve].distanceParcourue = parseFloat(dist);
}

// Démarrage du timer
function startTimer() {
  if(timer) return; // timer déjà lancé
  if(timeLeft <= 0) return;

  timer = setInterval(() => {
    timeLeft--;
    majAffichage();

    if(timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      alert(`Course de l'élève ${eleveData[currentEleve].prenom} terminée!`);
      passerEleveSuivant();
    }
  }, 1000);
}

function passerEleveSuivant() {
  if(currentEleve === 1) {
    // Passer au deuxième élève
    currentEleve = 2;
    alert("Passage à l'élève 2, prêt à démarrer sa course.");
    preparerCourse();
  } else {
    // Fin des deux courses, générer QR code
    afficherResultatsFinaux();
  }
}

// Préparer la course (afficher infos élève, reset données)
function preparerCourse() {
  // Afficher nom/prénom élève courant
  afficherNomPrenom();

  // Reset stats pour cet élève
  nbTours = 0;
  timeLeft = duration * 60;
  majAffichage();

  // Afficher section course
  courseSection.style.display = 'block';
  courseInputs.style.display = 'none';
  inputSection.style.display = 'none';

  // Boutons
  plusTourBtn.disabled = false;
  resetBtn.disabled = false;
  startBtn.style.display = 'none'; // masqué car on démarre via script ou bouton reset
}

// Afficher nom prénom de l'élève courant au-dessus du timer
function afficherNomPrenom() {
  // Crée ou met à jour un encadré au-dessus du timer
  let eleveInfo = document.getElementById('eleveInfo');
  if(!eleveInfo) {
    eleveInfo = document.createElement('div');
    eleveInfo.id = 'eleveInfo';
    eleveInfo.style.fontWeight = '700';
    eleveInfo.style.fontSize = '1.3em';
    eleveInfo.style.marginBottom = '0.5em';
    eleveInfo.style.textAlign = 'center';
    courseSection.insertBefore(eleveInfo, timerEl);
  }
  eleveInfo.textContent = `Course de : ${eleveData[currentEleve].prenom} ${eleveData[currentEleve].nom}`;
}

// Bouton + tour
plusTourBtn.addEventListener('click', () => {
  nbTours++;
  majAffichage();
});

// Bouton reset (arrêt course en cours et relance, ou passage)
resetBtn.addEventListener('click', () => {
  if(timer) {
    clearInterval(timer);
    timer = null;
  }
  // Si on est sur élève 1 et reset, on peut aussi retourner à saisie ? Pour simplifier ici on reset la course en cours
  nbTours = 0;
  timeLeft = duration * 60;
  majAffichage();
  startTimer();
});

// Bouton démarrer : récupère données, vérifie, et lance 1ère course
startBtn.addEventListener('click', () => {
  // Récupérer données élèves
  eleveData[1].nom = document.getElementById('nom1').value.trim();
  eleveData[1].prenom = document.getElementById('prenom1').value.trim();
  eleveData[1].classe = document.getElementById('classe1').value.trim();
  eleveData[1].sexe = document.getElementById('sexe1').value;

  eleveData[2].nom = document.getElementById('nom2').value.trim();
  eleveData[2].prenom = document.getElementById('prenom2').value.trim();
  eleveData[2].classe = document.getElementById('classe2').value.trim();
  eleveData[2].sexe = document.getElementById('sexe2').value;

  // Vérifications basiques
  if(!eleveData[1].nom || !eleveData[1].prenom || !eleveData[1].sexe) {
    alert("Merci de remplir nom, prénom et sexe de l'élève 1");
    return;
  }
  if(!eleveData[2].nom || !eleveData[2].prenom || !eleveData[2].sexe) {
    alert("Merci de remplir nom, prénom et sexe de l'élève 2");
    return;
  }

  // Récupérer durée, distance et VMA
  const dureeVal = parseInt(document.getElementById('dureeCourse').value, 10);
  const distVal = parseFloat(document.getElementById('distanceTour').value);
  const vmaVal = parseFloat(document.getElementById('vmaConnue').value);

  if(isNaN(dureeVal) || dureeVal <= 0) {
    alert("Merci de renseigner une durée de course valide (en minutes)");
    return;
  }
  if(isNaN(distVal) || distVal <= 0) {
    alert("Merci de renseigner une distance de tour valide (en mètres)");
    return;
  }

  duration = dureeVal;
  distanceTour = distVal;
  vmaConnue = isNaN(vmaVal) ? 0 : vmaVal;

  // On lance la 1ère course
  currentEleve = 1;
  preparerCourse();
  startTimer();

  // On cache le bouton démarrer
  startBtn.style.display = 'none';
});

// Fonction qui crée un QR code avec les infos des 2 élèves (avec une bibliothèque QR)
function afficherResultatsFinaux() {
  courseSection.style.display = 'none';

  // Générer texte QR code
  const infoQRCode = {
    eleves: [
      {
        nom: eleveData[1].nom,
        prenom: eleveData[1].prenom,
        distance: eleveData[1].distanceParcourue,
        vmaEstimee: eleveData[1].vmaEstimee.toFixed(2)
      },
      {
        nom: eleveData[2].nom,
        prenom: eleveData[2].prenom,
        distance: eleveData[2].distanceParcourue,
        vmaEstimee: eleveData[2].vmaEstimee.toFixed(2)
      }
    ]
  };

  // Afficher résumé
  let resultDiv = document.getElementById('resultatsFinal');
  if(!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = 'resultatsFinal';
    resultDiv.style.textAlign = 'center';
    resultDiv.style.marginTop = '2em';
    document.querySelector('main').appendChild(resultDiv);
  }
  resultDiv.innerHTML = '<h2>Résultats finaux</h2>';

  // Infos lisibles
  infoQRCode.eleves.forEach((e, i) => {
    resultDiv.innerHTML += `<p><strong>Élève ${i+1} :</strong> ${e.prenom} ${e.nom} - Distance: ${e.distance} m - VMA estimée: ${e.vmaEstimee} km/h</p>`;
  });

  // Générer QR code avec library qrcode.js (à inclure dans eleve.html)
  if(!window.QRCode) {
    resultDiv.innerHTML += '<p style="color:red;">Librairie QRCode non chargée, impossible de générer le QR code.</p>';
    return;
  }

  const qrDiv = document.createElement('div');
  qrDiv.id = 'qrcode';
  qrDiv.style.margin = '1em auto';
  resultDiv.appendChild(qrDiv);

  // Convert info en JSON string
  const qrText = JSON.stringify(infoQRCode);
  new QRCode(qrDiv, {
    text: qrText,
    width: 200,
    height: 200,
  });
}
