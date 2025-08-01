// eleve.js

let chronoInterval;
let tempsRestant = 0; // en secondes
let tours = 0;
let distanceTour = 400;
let chronoActif = false;

// Démarrer le chrono
document.getElementById('startBtn').addEventListener('click', () => {
  const duree = parseInt(document.getElementById('dureeCourse').value) || 6;
  distanceTour = parseInt(document.getElementById('distanceTour').value) || 400;
  tempsRestant = duree * 60; // converti en secondes
  tours = 0;

  document.getElementById('infosCourse').style.display = 'block';
  document.getElementById('qrContainer').style.display = 'none';
  updateDisplay();

  if (chronoInterval) clearInterval(chronoInterval);
  chronoActif = true;

  chronoInterval = setInterval(() => {
    if (tempsRestant > 0) {
      tempsRestant--;
      updateDisplay();
    } else {
      clearInterval(chronoInterval);
      chronoActif = false;
      genererQRCode();
    }
  }, 1000);
});

// Ajouter un tour
document.getElementById('addTourBtn').addEventListener('click', () => {
  if (!chronoActif) return;
  tours++;
  updateDisplay();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(chronoInterval);
  chronoActif = false;
  tempsRestant = 0;
  tours = 0;
  document.getElementById('infosCourse').style.display = 'none';
  document.getElementById('qrContainer').style.display = 'none';
});

// Mettre à jour l'affichage
function updateDisplay() {
  // Format mm:ss
  const minutes = Math.floor(tempsRestant / 60);
  const secondes = tempsRestant % 60;
  document.getElementById('chrono').textContent = `Temps restant : ${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;

  const distanceTotale = tours * distanceTour; // en mètres
  document.getElementById('tours').textContent = `Nombre de tours : ${tours}`;
  document.getElementById('distance').textContent = `Distance parcourue : ${distanceTotale} m`;

  // Vitesse moyenne (km/h)
  const tempsEcoule = (parseInt(document.getElementById('dureeCourse').value) * 60) - tempsRestant;
  let vitesseMoy = 0;
  if (tempsEcoule > 0) {
    vitesseMoy = (distanceTotale / 1000) / (tempsEcoule / 3600); // km/h
  }
  document.getElementById('vitesse').textContent = `Vitesse moyenne : ${vitesseMoy.toFixed(2)} km/h`;

  // Estimation VMA = distance totale / durée totale en heures
  const dureeTotaleHeures = parseInt(document.getElementById('dureeCourse').value) / 60;
  const vma = (distanceTotale / 1000) / dureeTotaleHeures;
  document.getElementById('vma').textContent = `Estimation VMA : ${vma.toFixed(2)} km/h`;
}

// Générer le QR Code automatiquement à la fin
function genererQRCode() {
  // Récupérer infos élèves
  const eleve1 = {
    nom: document.getElementById('nom1').value,
    prenom: document.getElementById('prenom1').value,
    classe: document.getElementById('classe1').value,
    sexe: document.getElementById('sexe1').value
  };

  const eleve2 = {
    nom: document.getElementById('nom2').value,
    prenom: document.getElementById('prenom2').value,
    classe: document.getElementById('classe2').value,
    sexe: document.getElementById('sexe2').value
  };

  const distanceTotale = tours * distanceTour;
  const dureeMinutes = parseInt(document.getElementById('dureeCourse').value);

  const resultats = {
    eleve1,
    eleve2,
    distance: distanceTotale,
    tours,
    duree: dureeMinutes,
    vma: ((distanceTotale / 1000) / (dureeMinutes / 60)).toFixed(2)
  };

  const qr = new QRious({
    element: document.getElementById('qrCode'),
    value: JSON.stringify(resultats),
    size: 200
  });

  document.getElementById('qrContainer').style.display = 'block';
}

