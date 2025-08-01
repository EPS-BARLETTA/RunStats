// eleve.js - Gestion de la course et QR code

document.addEventListener('DOMContentLoaded', () => {
  // Récupération éléments
  const btnStart = document.getElementById('btnStart');
  const btnLap = document.getElementById('btnLap');
  const btnReset = document.getElementById('btnReset');

  const distanceAffichee = document.getElementById('distanceAffichee');
  const vitesseAffichee = document.getElementById('vitesseAffichee');

  const qrCodeContainer = document.getElementById('qrCodeContainer');

  let distanceTour = 0;
  let dureeCourse = 0;
  let laps = 0;
  let isRunning = false;
  let startTime = null;
  let intervalId = null;

  // Fonction pour mettre à jour l'affichage distance et vitesse
  function updateDisplay() {
    const distanceParcourue = laps * distanceTour;
    distanceAffichee.textContent = `Distance parcourue : ${distanceParcourue} m`;

    const elapsedMin = (Date.now() - startTime) / 1000 / 60;
    const vitesseMoyenne = elapsedMin > 0 ? (distanceParcourue / 1000) / elapsedMin : 0;
    vitesseAffichee.textContent = `Vitesse moyenne : ${vitesseMoyenne.toFixed(2)} km/h`;
  }

  // Fonction pour démarrer la course
  btnStart.addEventListener('click', () => {
    if (isRunning) return;

    distanceTour = Number(document.getElementById('distanceTour').value);
    dureeCourse = Number(document.getElementById('duree').value);

    if (!distanceTour || !dureeCourse || distanceTour <= 0 || dureeCourse <= 0) {
      alert('Veuillez renseigner une durée et une distance du tour valides.');
      return;
    }

    laps = 0;
    startTime = Date.now();
    isRunning = true;
    qrCodeContainer.style.display = 'none';

    updateDisplay();

    // On pourrait lancer un timer ici si besoin (ex: pour durée max)
  });

  // Ajouter un tour
  btnLap.addEventListener('click', () => {
    if (!isRunning) return;

    laps++;
    updateDisplay();

    // Si on atteint la durée (min) on stoppe et affiche QR code
    const elapsedMin = (Date.now() - startTime) / 1000 / 60;
    if (elapsedMin >= dureeCourse) {
      isRunning = false;
      generateQRCode();
    }
  });

  // Reset tout
  btnReset.addEventListener('click', () => {
    isRunning = false;
    laps = 0;
    startTime = null;
    distanceAffichee.textContent = 'Distance parcourue : 0 m';
    vitesseAffichee.textContent = 'Vitesse moyenne : 0 km/h';
    qrCodeContainer.style.display = 'none';
  });

  // Générer QR code des données de la course et élèves
  function generateQRCode() {
    const eleve1 = {
      nom: document.getElementById('nom1').value.trim(),
      prenom: document.getElementById('prenom1').value.trim(),
      classe: document.getElementById('classe1').value.trim(),
      sexe: document.getElementById('sexe1').value
    };
    const eleve2 = {
      nom: document.getElementById('nom2').value.trim(),
      prenom: document.getElementById('prenom2').value.trim(),
      classe: document.getElementById('classe2').value.trim(),
      sexe: document.getElementById('sexe2').value
    };

    const data = {
      eleve1,
      eleve2,
      distanceParcourue: laps * distanceTour,
      dureeCourse,
      vitesseMoyenne:
        (laps * distanceTour) / 1000 / dureeCourse // km/h approximatif en divisant distance par durée
    };

    const jsonData = JSON.stringify(data);

    qrCodeContainer.style.display = 'block';
    qrCodeContainer.innerHTML = ''; // Clear previous

    // Créer QR code (attention, tu dois inclure la lib QRCode.js dans ton HTML)
    new QRCode(qrCodeContainer, {
      text: jsonData,
      width: 200,
      height: 200
    });
  }
});
