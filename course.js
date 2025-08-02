document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentEleve = parseInt(urlParams.get("eleve")); // 1 ou 2

  const eleveData = JSON.parse(localStorage.getItem(`eleve${currentEleve}`));
  const courseInfo = JSON.parse(localStorage.getItem("courseInfo"));

  // Sélecteurs
  const timerDisplay = document.getElementById("timerDisplay");
  const eleveName = document.getElementById("eleveName");
  const addLapBtn = document.getElementById("addLapBtn");
  const distanceTotaleEl = document.getElementById("distanceTotale");
  const vitesseMoyenneEl = document.getElementById("vitesseMoyenne");
  const estimationVMAEl = document.getElementById("estimationVMA");
  const fractionBtns = document.querySelectorAll(".btn-fraction");
  const endCourseBtn = document.getElementById("endCourseBtn");

  let tempsRestant = parseInt(courseInfo.duree) * 60; // en secondes
  let distanceTotale = 0;
  const distanceTour = parseFloat(courseInfo.distanceTour);

  eleveName.textContent = `${eleveData.prenom} ${eleveData.nom}`;

  // --- Compte à rebours ---
  function updateTimer() {
    const minutes = Math.floor(tempsRestant / 60);
    const seconds = tempsRestant % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Clignotement 10 dernières secondes
    if (tempsRestant <= 10) {
      timerDisplay.classList.toggle("blink");
    }

    if (tempsRestant <= 0) {
      clearInterval(timer);
      endCourse();
    }
    tempsRestant--;
  }

  const timer = setInterval(updateTimer, 1000);
  updateTimer();

  // --- Ajout tour ---
  addLapBtn.addEventListener("click", () => {
    distanceTotale += distanceTour;
    majStats();
  });

  // --- Ajout fraction ---
  fractionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const fraction = parseFloat(btn.dataset.fraction);
      distanceTotale += distanceTour * fraction;
      majStats();
    });
  });

  // --- Mise à jour stats ---
  function majStats() {
    distanceTotaleEl.textContent = `${distanceTotale.toFixed(2)} m`;

    // Vitesse moyenne (km/h)
    const tempsMinutes = parseInt(courseInfo.duree);
    const vitesseMoy = (distanceTotale / 1000) / (tempsMinutes / 60);
    vitesseMoyenneEl.textContent = `${vitesseMoy.toFixed(2)} km/h`;

    // Estimation VMA
    estimationVMAEl.textContent = `${(vitesseMoy * 1.1).toFixed(2)} km/h`;
  }

  // --- Fin course ---
  function endCourse() {
    // Sauvegarder distance
    eleveData.distance = distanceTotale;
    eleveData.vitesse = vitesseMoyenneEl.textContent;
    eleveData.vmaEstimee = estimationVMAEl.textContent;

    localStorage.setItem(`resultats${currentEleve}`, JSON.stringify(eleveData));

    if (currentEleve === 1) {
      // Passer à l'élève 2
      window.location.href = "course.html?eleve=2";
    } else {
      // Aller vers téléchargement
      window.location.href = "telechargement.html";
    }
  }

  endCourseBtn.addEventListener("click", endCourse);
});

