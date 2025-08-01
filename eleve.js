// eleve.js

// Élève 1 éléments
const nom1 = document.getElementById('nom1');
const prenom1 = document.getElementById('prenom1');
const classe1 = document.getElementById('classe1');
const sexe1 = document.getElementById('sexe1');

const duree1Input = document.getElementById('duree1');
const distanceTour1Input = document.getElementById('distanceTour1');

const tours1Span = document.getElementById('tours1');
const distanceTotale1Span = document.getElementById('distanceTotale1');
const vma1Span = document.getElementById('vma1');

// Élève 2 éléments
const nom2 = document.getElementById('nom2');
const prenom2 = document.getElementById('prenom2');
const classe2 = document.getElementById('classe2');
const sexe2 = document.getElementById('sexe2');

const duree2Input = document.getElementById('duree2');
const distanceTour2Input = document.getElementById('distanceTour2');

const tours2Span = document.getElementById('tours2');
const distanceTotale2Span = document.getElementById('distanceTotale2');
const vma2Span = document.getElementById('vma2');

// Boutons
const startBtn = document.getElementById('startBtn');
const tourBtn = document.getElementById('tourBtn');
const resetBtn = document.getElementById('resetBtn');

// QR code container
const qrCodeContainer = document.getElementById('qrCodeContainer');

// Variables de chrono/décompte
let tempsTotal1 = 0;  // en secondes
let tempsTotal2 = 0;

let tours1 = 0;
let tours2 = 0;

let duree1 = 0;  // durée course en minutes (modifiable)
let duree2 = 0;

let distanceTour1 = 0; // en mètres (modifiable)
let distanceTour2 = 0;

let chronoInterval = null;
let phase = 1;  // 1 pour élève 1, 2 pour élève 2
let tempsRestant = 0; // en secondes, pour décompte

function updateDisplay() {
  // Durée saisie
  duree1 = parseFloat(duree1Input.value) || 0;
  duree2 = parseFloat(duree2Input.value) || 0;
  distanceTour1 = parseFloat(distanceTour1Input.value) || 0;
  distanceTour2 = parseFloat(distanceTour2Input.value) || 0;

  // Tours et distances
  tours1Span.textContent = tours1;
  tours2Span.textContent = tours2;

  distanceTotale1Span.textContent = (tours1 * distanceTour1).toFixed(1);
  distanceTotale2Span.textContent = (tours2 * distanceTour2).toFixed(1);

  // VMA estimée (distance totale / durée en secondes * 3.6)
  // VMA en km/h = (distance en m / durée en s) * 3.6
  let vmaCalc1 = 0;
  let vmaCalc2 = 0;

  if (tempsTotal1 > 0) {
    vmaCalc1 = (tours1 * distanceTour1) / tempsTotal1 * 3.6;
  }
  if (tempsTotal2 > 0) {
    vmaCalc2 = (tours2 * distanceTour2) / tempsTotal2 * 3.6;
  }

  vma1Span.textContent = vmaCalc1 > 0 ? vmaCalc1.toFixed(2) : '';
  vma2Span.textContent = vmaCalc2 > 0 ? vmaCalc2.toFixed(2) : '';
}

function resetCourse() {
  clearInterval(chronoInterval);
  tempsTotal1 = 0;
  tempsTotal2 = 0;
  tours1 = 0;
  tours2 = 0;
  phase = 1;
  tempsRestant = duree1 * 60;
  tourBtn.disabled = true;
  startBtn.textContent = 'Démarrer le chrono';
  updateTimerDisplay(tempsRestant);
  updateDisplay();
  qrCodeContainer.innerHTML = ''; // Effacer QR code
}

function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('timerDisplay').textContent = `${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

function startChrono() {
  duree1 = parseFloat(duree1Input.value) || 0;
  duree2 = parseFloat(duree2Input.value) || 0;

  if (duree1 <= 0 || duree2 <= 0) {
    alert('Merci de renseigner une durée valide pour les deux élèves.');
    return;
  }

  startBtn.disabled = true;
  tourBtn.disabled = false;
  resetBtn.disabled = false;

  tempsRestant = phase === 1 ? duree1 * 60 : duree2 * 60;
  updateTimerDisplay(tempsRestant);

  chronoInterval = setInterval(() => {
    if (tempsRestant <= 0) {
      // Fin phase élève
      if (phase === 1) {
        tempsTotal1 = duree1 * 60; // secondes
        phase = 2;
        alert("Fin de la course Élève 1. Lancez la course pour Élève 2.");
        tempsRestant = duree2 * 60;
        updateTimerDisplay(tempsRestant);
        tours1 = tours1; // garde les tours faits
      } else {
        // fin élève 2
        tempsTotal2 = duree2 * 60;
        clearInterval(chronoInterval);
        startBtn.disabled = false;
        tourBtn.disabled = true;
        resetBtn.disabled = false;
        alert("Fin des deux courses. QR Code généré ci-dessous.");
        generateQRCode();
      }
    } else {
      tempsRestant--;
      updateTimerDisplay(tempsRestant);
      if (phase === 1) {
        tempsTotal1 = duree1 * 60 - tempsRestant;
      } else {
        tempsTotal2 = duree2 * 60 - tempsRestant;
      }
    }
  }, 1000);
}

function addTour() {
  if (phase === 1) {
    tours1++;
  } else {
    tours2++;
  }
  updateDisplay();
}

function generateQRCode() {
  // Données élèves
  const data = {
    eleve1: {
      nom: nom1.value.trim(),
      prenom: prenom1.value.trim(),
      classe: classe1.value.trim(),
      sexe: sexe1.value,
      dureeCourse: duree1,
      tours: tours1,
      distanceTour: distanceTour1,
      distanceTotale: tours1 * distanceTour1,
      vma: vma1Span.textContent
    },
    eleve2: {
      nom: nom2.value.trim(),
      prenom: prenom2.value.trim(),
      classe: classe2.value.trim(),
      sexe: sexe2.value,
      dureeCourse: duree2,
      tours: tours2,
      distanceTour: distanceTour2,
      distanceTotale: tours2 * distanceTour2,
      vma: vma2Span.textContent
    }
  };

  const jsonData = JSON.stringify(data);
  qrCodeContainer.innerHTML = '';
  new QRCode(qrCodeContainer, {
    text: jsonData,
    width: 200,
    height: 200
  });
}

// Événements
startBtn.addEventListener('click', () => {
  if (startBtn.textContent === 'Démarrer le chrono') {
    startChrono();
    startBtn.textContent = 'Course en cours...';
  }
});

tourBtn.addEventListener('click', () => {
  addTour();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Voulez-vous vraiment réinitialiser la course ?')) {
    resetCourse();
  }
});

// Initialisation
resetCourse();
updateDisplay();
