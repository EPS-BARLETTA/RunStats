console.log("eleve.js chargé");

const startBtn = document.getElementById("startBtn");
const plusTourBtn = document.getElementById("plusTourBtn");
const resetBtn = document.getElementById("resetBtn");
const courseDataSection = document.getElementById("courseData");
const messageFinCourse = document.getElementById("messageFinCourse");
const startCourse2Btn = document.getElementById("startCourse2Btn");

const eleveEnCourseSpan = document.getElementById("eleveEnCourse");
const nombreToursSpan = document.getElementById("nombreTours");
const distanceParcourueSpan = document.getElementById("distanceParcourue");
const vitesseSpan = document.getElementById("vitesse");
const vmaEstimeeSpan = document.getElementById("vmaEstimee");
const timerDisplay = document.getElementById("timerDisplay");

let dureeCourse = 0;
let distanceTour = 0;
let vmaConnue = 0;

let timerId = null;
let tempsRestant = 0;

let currentCourse = 1;
let tours = 0;
let eleveEnCourse = 1; // 1 ou 2

function getInputValues() {
  return {
    nom1: document.getElementById("nom1").value.trim(),
    prenom1: document.getElementById("prenom1").value.trim(),
    classe1: document.getElementById("classe1").value.trim(),
    sexe1: document.getElementById("sexe1").value,

    nom2: document.getElementById("nom2").value.trim(),
    prenom2: document.getElementById("prenom2").value.trim(),
    classe2: document.getElementById("classe2").value.trim(),
    sexe2: document.getElementById("sexe2").value,

    duree: Number(document.getElementById("dureeCourse").value),
    distance: Number(document.getElementById("distanceTour").value),
    vma: Number(document.getElementById("vmaConnue").value) || 0,
  };
}

function resetInterface() {
  tours = 0;
  eleveEnCourse = 1;
  currentCourse = 1;
  clearInterval(timerId);
  timerId = null;
  tempsRestant = 0;

  nombreToursSpan.textContent = "0";
  distanceParcourueSpan.textContent = "0";
  vitesseSpan.textContent = "0";
  vmaEstimeeSpan.textContent = "0";
  timerDisplay.textContent = "";

  courseDataSection.classList.add("hidden");
  messageFinCourse.classList.add("hidden");

  // Afficher les champs saisie
  document.querySelector(".eleves-container").style.display = "flex";
  document.querySelector(".course-info").style.display = "block";
  document.querySelector(".buttons-container").style.display = "block";

  plusTourBtn.disabled = true;
  startBtn.disabled = false;
  startCourse2Btn.style.display = "none";
}

function afficherEleveEnCourse() {
  const inputs = getInputValues();
  if (eleveEnCourse === 1) {
    eleveEnCourseSpan.textContent = `${inputs.prenom1} ${inputs.nom1}`;
  } else {
    eleveEnCourseSpan.textContent = `${inputs.prenom2} ${inputs.nom2}`;
  }
}

function startTimer() {
  tempsRestant = dureeCourse * 60;
  updateTimerDisplay();

  timerId = setInterval(() => {
    tempsRestant--;
    updateTimerDisplay();
    if (tempsRestant <= 0) {
      clearInterval(timerId);
      finCourse();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(tempsRestant);
  if (tempsRestant <= 10) {
    timerDisplay.style.color = tempsRestant % 2 === 0 ? "red" : "black";
  } else {
    timerDisplay.style.color = "black";
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function finCourse() {
  plusTourBtn.disabled = true;
  startBtn.disabled = true;
  alert(`Fin de la course ${currentCourse}. Cliquez sur "Passer à la course 2" ou "Reset" pour recommencer.`);

  messageFinCourse.querySelector("p").textContent = `Course ${currentCourse} terminée.`;
  messageFinCourse.classList.remove("hidden");
  startCourse2Btn.style.display = currentCourse === 1 ? "inline-block" : "none";
}

function calculerVitesseKmH(distanceMetres, tempsSecondes) {
  return (distanceMetres / tempsSecondes) * 3.6;
}

function estimationVMA(vitesseKmH) {
  // simple estimation, ici juste retourner la vitesse max atteinte
  return vitesseKmH;
}

startBtn.addEventListener("click", () => {
  const inputs = getInputValues();
  dureeCourse = inputs.duree;
  distanceTour = inputs.distance;
  vmaConnue = inputs.vma;

  if (
    !inputs.nom1 || !inputs.prenom1 || !inputs.classe1 || !inputs.sexe1 ||
    !inputs.nom2 || !inputs.prenom2 || !inputs.classe2 || !inputs.sexe2 ||
    dureeCourse <= 0 || distanceTour <= 0
  ) {
    alert("Veuillez remplir tous les champs et saisir une durée et une distance valides.");
    return;
  }

  // Cacher la saisie, afficher données course
  document.querySelector(".eleves-container").style.display = "none";
  document.querySelector(".course-info").style.display = "none";

  courseDataSection.classList.remove("hidden");
  plusTourBtn.disabled = false;
  startBtn.disabled = true;
  afficherEleveEnCourse();
  tours = 0;

  startTimer();
});

plusTourBtn.addEventListener("click", () => {
  tours++;
  nombreToursSpan.textContent = tours;

  const tempsEcoule = dureeCourse * 60 - tempsRestant;
  const distanceParcourue = tours * distanceTour;
  distanceParcourueSpan.textContent = distanceParcourue;

  // vitesse en km/h
  const vitesse = calculerVitesseKmH(distanceParcourue, tempsEcoule);
  vitesseSpan.textContent = vitesse.toFixed(2);

  // estimation VMA
  const vmaEst = estimationVMA(vitesse);
  vmaEstimeeSpan.textContent = vmaEst.toFixed(2);

  // Changer élève en course à chaque tour
  eleveEnCourse = eleveEnCourse === 1 ? 2 : 1;
  afficherEleveEnCourse();
});

resetBtn.addEventListener("click", () => {
  resetInterface();
});

startCourse2Btn.addEventListener("click", () => {
  currentCourse = 2;
  tours = 0;
  tempsRestant = dureeCourse * 60;

  messageFinCourse.classList.add("hidden");
  courseDataSection.classList.remove("hidden");
  plusTourBtn.disabled = false;
  startCourse2Btn.style.display = "none";

  // Remettre les données visibles (cours)
  document.querySelector(".eleves-container").style.display = "none";
  document.querySelector(".course-info").style.display = "none";

  afficherEleveEnCourse();
  startTimer();
});

// Initialisation
resetInterface();
