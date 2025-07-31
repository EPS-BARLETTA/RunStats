// Variables globales
let chronoInterval;
let chronoTemps = 0; // en secondes
let tours = 0;
let course1Done = false;
let eleve1 = null;
let eleve2 = null;

// Eléments DOM
const chronoDisplay = document.getElementById('chronoDisplay');
const btnStart = document.getElementById('btnStart');
const btnLap = document.getElementById('btnLap');
const btnReset = document.getElementById('btnReset');
const distanceTotalDisplay = document.getElementById('distanceTotal');
const etatForme = document.getElementById('etatForme');
const qrCodeBox = document.getElementById('qrCodeBox');
const qrCodeContainer = document.getElementById('qrCodeContainer');

// Reset interface à l'ouverture
resetAll();

function startChrono() {
  if (chronoInterval) return; // déjà lancé
  chronoInterval = setInterval(() => {
    chronoTemps++;
    updateChronoDisplay();
  }, 1000);
}

function stopChrono() {
  clearInterval(chronoInterval);
  chronoInterval = null;
}

function updateChronoDisplay() {
  let minutes = Math.floor(chronoTemps / 60);
  let secondes = chronoTemps % 60;
  chronoDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;
}

btnStart.addEventListener('click', () => {
  startChrono();
});

btnLap.addEventListener('click', () => {
  if (!chronoInterval) return; // si chrono pas lancé, rien à faire
  tours++;
  updateToursDisplay();
  // Calcul distance totale
  const distanceTourInput = parseFloat(document.getElementById('distanceTour').value);
  if (!isNaN(distanceTourInput) && distanceTourInput > 0) {
    const distTotal = tours * distanceTourInput;
    distanceTotalDisplay.textContent = distTotal;
  }
});

btnReset.addEventListener('click', () => {
  resetAll();
});

// Affiche le nombre de tours
function updateToursDisplay() {
  document.getElementById('toursCount').textContent = tours;
}

function resetAll() {
  stopChrono();
  chronoTemps = 0;
  tours = 0;
  updateChronoDisplay();
  updateToursDisplay();
  distanceTotalDisplay.textContent = '0';
  etatForme.style.display = 'none';
  qrCodeBox.style.display = 'none';
  btnStart.disabled = false;
  btnLap.disabled = false;
  btnReset.disabled = false;
  course1Done = false;
  eleve1 = null;
  eleve2 = null;
  clearInputs();
}

function clearInputs() {
  document.getElementById('nom1').value = '';
  document.getElementById('prenom1').value = '';
  document.getElementById('sexe1').value = 'M';
  document.getElementById('nom2').value = '';
  document.getElementById('prenom2').value = '';
  document.getElementById('sexe2').value = 'M';
  document.getElementById('duree').value = '';
  document.getElementById('distanceTour').value = '';
}

// Gestion saisie état (emoji) après chaque course
const etatButtons = document.querySelectorAll('.etatBtn');
etatButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;

    // Récupérer les infos
    const dureeInput = parseFloat(document.getElementById('duree').value);
    const distanceTotal = parseFloat(distanceTotalDisplay.textContent) || 0;

    // Validation des champs
    let nom, prenom, sexe;
    if (!course1Done) {
      nom = document.getElementById('nom1').value.trim();
      prenom = document.getElementById('prenom1').value.trim();
      sexe = document.getElementById('sexe1').value;
    } else {
      nom = document.getElementById('nom2').value.trim();
      prenom = document.getElementById('prenom2').value.trim();
      sexe = document.getElementById('sexe2').value;
    }

    if (!nom || !prenom || isNaN(dureeInput) || dureeInput <= 0) {
      alert('Veuillez remplir nom, prénom et durée corrects.');
      return;
    }

    // Calcul vitesse moyenne (km/h) et VMA estimée
    const distanceKm = distanceTotal / 1000;
    const tempsHeure = dureeInput / 60;
    const vitesse = (distanceKm / tempsHeure).toFixed(2);
    const vma = (distanceKm / (tempsHeure * 0.92)).toFixed(2);

    const infos = {
      nom,
      prenom,
      sexe,
      duree: dureeInput,
      distance: distanceTotal,
      vitesse,
      vma,
      etat
    };

    if (!course1Done) {
      eleve1 = infos;
      course1Done = true;
      alert('Course 1 terminée, saisissez les infos pour l\'élève 2.');

      // Reset chrono, tours, distance mais garde les infos élèves 1
      resetChronoToursDistanceForNext();
    } else {
      eleve2 = infos;
      alert('Course 2 terminée, génération du QR code.');
      etatForme.style.display = 'none';
      btnStart.disabled = true;
      btnLap.disabled = true;
      btnReset.disabled = true;

      // Générer QR code avec données des deux élèves
      generateQRCode([eleve1, eleve2]);
    }
  });
});

// Réinitialiser chrono, tours et distance pour la 2e course
function resetChronoToursDistanceForNext() {
  stopChrono();
  chronoTemps = 0;
  tours = 0;
  updateChronoDisplay();
  updateToursDisplay();
  distanceTotalDisplay.textContent = '0';
  // Clear durée et distanceTour pour la 2e course
  document.getElementById('duree').value = '';
  document.getElementById('distanceTour').value = '';
  etatForme.style.display = 'block';
  btnStart.disabled = false;
  btnLap.disabled = false;
  btnReset.disabled = false;
}

// Génération QR code
function generateQRCode(dataArray) {
  qrCodeBox.style.display = 'block';
  qrCodeContainer.innerHTML = ''; // reset

  const qr = new QRCode(qrCodeContainer, {
    width: 200,
    height: 200,
  });

  const qrData = JSON.stringify(dataArray, null, 2);
  qr.makeCode(qrData);
}
