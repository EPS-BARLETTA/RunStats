// Récupération des données passées via sessionStorage
const eleve = JSON.parse(sessionStorage.getItem('eleveActif'));
const dureeMinutes = Number(sessionStorage.getItem('dureeCourse')) || 10; // durée par défaut 10min
const distanceTour = Number(sessionStorage.getItem('distanceTour')) || 400; // distance tour en mètres (par défaut 400m)

// Variables d'état
let toursCount = 0;
let fractions = 0;
let startTime = null;
let timerInterval = null;

// Affichage des infos élève
document.getElementById('nom').textContent = eleve.nom || '';
document.getElementById('prenom').textContent = eleve.prenom || '';
document.getElementById('classe').textContent = eleve.classe || '';
document.getElementById('sexe').textContent = eleve.sexe || '';

// Mise à jour timer
const timerDisplay = document.getElementById('timer');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateStats() {
  const distanceTotal = (toursCount + fractions) * distanceTour; // en m
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const vitesse = (distanceTotal / 1000) / (elapsedSeconds / 3600); // km/h
  const vma = vitesse * 1.05; // estimation simple, 5% au-dessus de la vitesse moyenne

  document.getElementById('distance').textContent = distanceTotal.toFixed(2);
  document.getElementById('vitesse').textContent = vitesse.toFixed(2);
  document.getElementById('vma').textContent = vma.toFixed(2);
}

function startTimer() {
  startTime = Date.now();
  const totalSeconds = dureeMinutes * 60;

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = totalSeconds - elapsed;

    if (remaining <= 10 && remaining > 0) {
      timerDisplay.classList.add('blink');
    } else {
      timerDisplay.classList.remove('blink');
    }

    if (remaining <= 0) {
      timerDisplay.textContent = '00:00';
      clearInterval(timerInterval);
      alert("Temps écoulé, terminez la course.");
      document.getElementById('finishCourseBtn').disabled = false;
      return;
    }

    timerDisplay.textContent = formatTime(remaining);
    updateStats();
  }, 250);
}

document.getElementById('addTourBtn').addEventListener('click', () => {
  toursCount++;
  updateStats();
});

document.querySelectorAll('.fraction-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    fractions += Number(btn.dataset.fraction);
    if (fractions > 1) {
      // Si dépasse 1, on transforme en tour entier + fraction restante
      toursCount += Math.floor(fractions);
      fractions = fractions % 1;
    }
    updateStats();
  });
});

document.getElementById('finishCourseBtn').addEventListener('click', () => {
  clearInterval(timerInterval);

  // Calculs finaux
  const distanceTotal = (toursCount + fractions) * distanceTour;
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const vitesse = (distanceTotal / 1000) / (elapsedSeconds / 3600);
  const vma = vitesse * 1.05;

  // Sauvegarder dans sessionStorage
  const result = {
    nom: eleve.nom,
    prenom: eleve.prenom,
    classe: eleve.classe,
    sexe: eleve.sexe,
    distance: distanceTotal,
    vitesse: vitesse,
    vma: vma,
  };

  sessionStorage.setItem('result_' + eleve.prenom, JSON.stringify(result));

  alert(`Course terminée pour ${eleve.prenom} ${eleve.nom}.\nDistance: ${distanceTotal.toFixed(2)} m\nVitesse: ${vitesse.toFixed(2)} km/h\nVMA estimée: ${vma.toFixed(2)} km/h`);

  // Rediriger vers la page de gestion pour la suite
  window.location.href = 'gestion.html';
});

// Démarrer le timer à l'ouverture
document.getElementById('finishCourseBtn').disabled = true;
startTimer();
