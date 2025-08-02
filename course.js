// Récupérer les infos depuis localStorage
const currentRunner = localStorage.getItem("currentRunner"); // "runner1" ou "runner2"
const runnerData = JSON.parse(localStorage.getItem(currentRunner));
const courseSettings = JSON.parse(localStorage.getItem("courseSettings"));

// Sélection des éléments
const runnerNameEl = document.getElementById("runnerName");
const timerEl = document.getElementById("timer");
const addLapBtn = document.getElementById("addLapBtn");
const totalDistanceEl = document.getElementById("totalDistance");
const averageSpeedEl = document.getElementById("averageSpeed");
const vmaEstimationEl = document.getElementById("vmaEstimation");
const finishBtn = document.getElementById("finishBtn");

// Variables
let totalDistance = 0;
let lapCount = 0;
let timeRemaining = courseSettings.duration; // en secondes
let timerInterval = null;
const lapDistance = courseSettings.distance; // distance par tour en mètres

// Afficher nom coureur
runnerNameEl.textContent = `${runnerData.prenom} ${runnerData.nom}`;

// Fonction format temps
function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Mise à jour stats
function updateStats() {
  totalDistanceEl.textContent = totalDistance.toFixed(2);
  const timeInHours = (courseSettings.duration - timeRemaining) / 3600;
  const avgSpeed = timeInHours > 0 ? (totalDistance / 1000) / timeInHours : 0; // km/h
  averageSpeedEl.textContent = avgSpeed.toFixed(2);
  // Estimation VMA : vitesse max sur le test
  vmaEstimationEl.textContent = avgSpeed.toFixed(2);
}

// Ajouter un tour complet
addLapBtn.addEventListener("click", () => {
  lapCount++;
  totalDistance += lapDistance;
  updateStats();
});

// Ajouter fractions de tour à la fin
document.querySelectorAll(".fractions button").forEach(button => {
  button.addEventListener("click", () => {
    const fraction = parseFloat(button.dataset.value);
    totalDistance += lapDistance * fraction;
    updateStats();
  });
});

// Minuteur
function startTimer() {
  timerEl.textContent = formatTime(timeRemaining);

  timerInterval = setInterval(() => {
    timeRemaining--;

    // Clignotement les 10 dernières secondes
    if (timeRemaining <= 10) {
      timerEl.classList.add("blink");
    }

    timerEl.textContent = formatTime(timeRemaining);

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = "0:00";
      timerEl.classList.remove("blink");
      finishBtn.disabled = false;
    }
  }, 1000);
}

// Fin de course
finishBtn.addEventListener("click", () => {
  // Sauvegarder résultats du coureur
  runnerData.distance = totalDistance.toFixed(2);
  runnerData.vitesse = averageSpeedEl.textContent;
  runnerData.vma = vmaEstimationEl.textContent;

  localStorage.setItem(currentRunner, JSON.stringify(runnerData));

  if (currentRunner === "runner1") {
    // Passer au second coureur
    localStorage.setItem("currentRunner", "runner2");
    window.location.href = "course.html";
  } else {
    // Les deux courses terminées -> passer au bilan
    window.location.href = "summary.html";
  }
});

// Lancer le minuteur dès chargement
startTimer();
