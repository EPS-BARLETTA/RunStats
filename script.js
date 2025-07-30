document.addEventListener("DOMContentLoaded", function () {

  // Variables course
  let timerInterval;
  let timeElapsed = 0;
  let isRunning = false;
  let laps = 0;

  // État de forme
  let etatSelectionne = "";

  // DOM éléments
  const startBtn = document.getElementById("startBtn");
  const lapBtn = document.getElementById("lapBtn");
  const resetBtn = document.getElementById("resetBtn");
  const chronoDisplay = document.getElementById("chronoDisplay");
  const lapsCount = document.getElementById("lapsCount");
  const distanceTotalEl = document.getElementById("distanceTotal");
  const distanceKmEl = document.getElementById("distanceKm");
  const vitesseMoyEl = document.getElementById("vitesseMoy");
  const vmaRealEl = document.getElementById("vmaReal");
  const etatFormeDiv = document.getElementById("etatForme");
  const etatButtons = document.querySelectorAll(".etatBtn");

  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const classeInput = document.getElementById("classe");
  const dureeInput = document.getElementById("duree");
  const distanceTourInput = document.getElementById("distanceTour");
  const vmaRefInput = document.getElementById("vmaRef");

  // Format temps mm:ss
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  function updateChrono() {
    timeElapsed++;
    chronoDisplay.textContent = formatTime(timeElapsed);
    const totalSec = parseInt(dureeInput.value) * 60;

    if (totalSec && totalSec - timeElapsed <= 10 && totalSec - timeElapsed > 0) {
      chronoDisplay.classList.add("red");
    } else {
      chronoDisplay.classList.remove("red");
    }

    if (totalSec && timeElapsed >= totalSec) {
      stopCourse();
    }
  }

  function startCourse() {
    if (
      !nomInput.value || !prenomInput.value || !classeInput.value ||
      !dureeInput.value || !distanceTourInput.value
    ) {
      alert("Merci de remplir tous les champs nécessaires.");
      return;
    }

    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    timeElapsed = 0;
    laps = 0;
    chronoDisplay.textContent = "00:00";
    lapsCount.textContent = laps;
    distanceTotalEl.textContent = 0;
    distanceKmEl.textContent = "0.00";
    vitesseMoyEl.textContent = "0.00";
    vmaRealEl.textContent = "0.00";
    etatFormeDiv.style.display = "none";
    etatSelectionne = "";

    timerInterval = setInterval(updateChrono, 1000);
  }

  function stopCourse() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    lapBtn.disabled = true;
    etatFormeDiv.style.display = "block";
  }

  function addLap() {
    if (!isRunning) return;
    laps++;
    lapsCount.textContent = laps;
    updateStats();
  }

  function resetCourse() {
    clearInterval(timerInterval);
    isRunning = false;
    timeElapsed = 0;
    laps = 0;
    lapsCount.textContent = laps;
    distanceTotalEl.textContent = 0;
    distanceKmEl.textContent = "0.00";
    vitesseMoyEl.textContent = "0.00";
    vmaRealEl.textContent = "0.00";
    chronoDisplay.textContent = "00:00";
    startBtn.disabled = false;
    lapBtn.disabled = true;
    etatFormeDiv.style.display = "none";
    etatSelectionne = "";
    chronoDisplay.classList.remove("red");
  }

  function updateStats() {
    const distanceTot = laps * Number(distanceTourInput.value);
    const dureeH = timeElapsed / 3600;
    const vitesse = dureeH > 0 ? distanceTot / 1000 / dureeH : 0;
    const vmaRef = Number(vmaRefInput.value);
    const vmaReal = vitesse * 1.05;

    distanceTotalEl.textContent = distanceTot;
    distanceKmEl.textContent = (distanceTot / 1000).toFixed(2);
    vitesseMoyEl.textContent = vitesse.toFixed(2);
    vmaRealEl.textContent = vmaReal.toFixed(2);
  }

  // Gestion des boutons
  startBtn.addEventListener("click", startCourse);
  lapBtn.addEventListener("click", addLap);
  resetBtn.addEventListener("click", resetCourse);

  etatButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      etatSelectionne = btn.getAttribute("data-etat");
      alert(`État sélectionné : ${etatSelectionne}`);
    });
  });

});
