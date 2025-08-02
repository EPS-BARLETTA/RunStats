// course.js

// Variables globales
let duration = 0;       // en secondes, durée de la course
let distancePerLap = 0; // en mètres
let totalLaps = 0;
let fractionToAdd = 0;
let timeLeft = 0;       // en secondes
let timerInterval = null;

const timerCircle = document.getElementById("timerCircle");
const addLapBtn = document.getElementById("addLapBtn");
const distanceTotalEl = document.getElementById("distanceTotal");
const avgSpeedEl = document.getElementById("avgSpeed");
const vmaEstEl = document.getElementById("vmaEst");
const fractionSection = document.getElementById("fractionSection");
const endCourseSection = document.getElementById("endCourseSection");
const endCourseBtn = document.getElementById("endCourseBtn");

// Récupérer les données passées par URL
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    elevePrenom: params.get("elevePrenom"),
    duration: Number(params.get("duration")),
    distancePerLap: Number(params.get("distancePerLap")),
  };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2,"0");
  const s = (seconds % 60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function startTimer() {
  timeLeft = duration;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 10) {
      timerCircle.classList.add("blink");
    } else {
      timerCircle.classList.remove("blink");
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerCircle.classList.remove("blink");
      // Afficher section fin de course
      fractionSection.style.display = "block";
      endCourseSection.style.display = "block";
      addLapBtn.disabled = true;
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerCircle.textContent = formatTime(timeLeft);
}

// Calculer stats
function updateStats() {
  // Distance totale en mètres
  const totalDistance = (totalLaps + fractionToAdd) * distancePerLap;

  // Temps écoulé en heures
  const elapsedTimeH = (duration - timeLeft) / 3600;

  // Vitesse moyenne km/h
  const avgSpeed = elapsedTimeH > 0 ? (totalDistance / 1000) / elapsedTimeH : 0;

  // Estimation VMA (vitesse max aérobie) : vitesse moyenne * facteur (ici 1.1)
  const vmaEst = avgSpeed * 1.1;

  distanceTotalEl.textContent = totalDistance.toFixed(2) + " m";
  avgSpeedEl.textContent = avgSpeed.toFixed(2) + " km/h";
  vmaEstEl.textContent = vmaEst.toFixed(2) + " km/h";
}

function addLap() {
  if (timeLeft <= 0) return; // Ne rien faire si temps écoulé
  totalLaps++;
  updateStats();
}

// Ajouter fraction
function addFraction(fraction) {
  fractionToAdd += fraction;
  updateStats();
  // Cacher options fractions après ajout
  fractionSection.style.display = "none";
  endCourseSection.style.display = "block";
}

// Fin de course -> bouton
function endCourse() {
  // Sauvegarder les données dans localStorage ou passer à la page suivante
  // Ici on redirige vers une page bilan (summary.html) en passant les données
  const params = new URLSearchParams();
  params.set("totalLaps", totalLaps);
  params.set("fractionToAdd", fractionToAdd);
  params.set("duration", duration);
  params.set("distancePerLap", distancePerLap);
  // Tu peux ajouter aussi le prénom etc
  // Exemple:
  params.set("elevePrenom", elevePrenom);

  window.location.href = "summary.html?" + params.toString();
}

// Initialisation
const { elevePrenom, duration: d, distancePerLap: dist } = getParams();
duration = d;
distancePerLap = dist;

document.getElementById("runnerName").textContent = elevePrenom;
fractionSection.style.display = "none";
endCourseSection.style.display = "none";

updateStats();
startTimer();

addLapBtn.addEventListener("click", addLap);

document.getElementById("fractionQuarter").addEventListener("click", () => addFraction(0.25));
document.getElementById("fractionHalf").addEventListener("click", () => addFraction(0.5));
document.getElementById("fractionThreeQuarters").addEventListener("click", () => addFraction(0.75));

endCourseBtn.addEventListener("click", endCourse);
