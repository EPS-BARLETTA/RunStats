let coureurActuel = 1;
let nombreTours = 0;
let tempsRestant = 0;
let timerInterval;
let isRunning = false;
let stats = [];

const timerDisplay = document.getElementById("timer");
const lapsDisplay = document.getElementById("laps");
const distanceDisplay = document.getElementById("distance");
const vitesseDisplay = document.getElementById("vitesse");
const vmaDisplay = document.getElementById("vma");

const lapBtn = document.getElementById("lapBtn");
const nextBtn = document.getElementById("nextBtn");
const summaryBtn = document.getElementById("summaryBtn");

const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
const longueur = parseFloat(sessionStorage.getItem("longueurTour"));
const duree = parseFloat(sessionStorage.getItem("dureeCourse"));

function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function updateAffichage() {
  const distance = nombreTours * longueur;
  const tempsEcoule = duree * 60 - tempsRestant;
  const tempsHeures = tempsEcoule / 3600;
  const vitesse = tempsHeures > 0 ? (distance / 1000) / tempsHeures : 0;
  const vma = vitesse * 1.15;

  lapsDisplay.textContent = nombreTours;
  distanceDisplay.textContent = distance.toFixed(0);
  vitesseDisplay.textContent = vitesse.toFixed(2);
  vmaDisplay.textContent = vma.toFixed(2);
}

function enregistrerStats() {
  const eleve = coureurActuel === 1 ? eleve1 : eleve2;
  const distance = nombreTours * longueur;
  const vitesse = (distance / 1000) / (duree / 60);
  const vma = vitesse * 1.15;

  stats.push({
    ...eleve,
    distance: distance,
    vitesse: vitesse,
    vma: vma,
  });
}

function terminerCourse() {
  clearInterval(timerInterval);
  isRunning = false;
  lapBtn.disabled = true;
  timerDisplay.classList.remove("clignote");

  enregistrerStats();

  if (coureurActuel === 1) {
    nextBtn.style.display = "inline-block";
  } else {
    summaryBtn.style.display = "inline-block";
  }
}

function demarrerChrono() {
  tempsRestant = duree * 60;
  isRunning = true;
  lapBtn.disabled = false;
  timerDisplay.textContent = formatTime(tempsRestant);

  timerInterval = setInterval(() => {
    tempsRestant--;
    timerDisplay.textContent = formatTime(tempsRestant);

    if (tempsRestant <= 10) {
      timerDisplay.classList.add("clignote");
    } else {
      timerDisplay.classList.remove("clignote");
    }

    updateAffichage();

    if (tempsRestant <= 0) {
      terminerCourse();
    }
  }, 1000);
}

lapBtn.addEventListener("click", () => {
  if (!isRunning) return;
  nombreTours++;
  updateAffichage();
});

nextBtn.addEventListener("click", () => {
  coureurActuel = 2;
  nombreTours = 0;
  document.getElementById("title").innerText = `Course de ${eleve2.prenom} ${eleve2.nom}`;
  nextBtn.style.display = "none";
  timerDisplay.textContent = "00:00";
  lapsDisplay.textContent = "0";
  distanceDisplay.textContent = "0";
  vitesseDisplay.textContent = "0";
  vmaDisplay.textContent = "0";
  demarrerChrono();
});

summaryBtn.addEventListener("click", () => {
  sessionStorage.setItem("stats", JSON.stringify(stats));
  window.location.href = "resume.html";
});

window.onload = () => {
  document.getElementById("title").innerText = `Course de ${eleve1.prenom} ${eleve1.nom}`;
  demarrerChrono();
};
