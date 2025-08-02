// Variables globales
let eleves = [];
let courseActive = false;
let timerInterval;
let tempsRestant = 0;
let distanceTour = 400;

// DOM elements
const elevesContainer = document.getElementById("eleves-container");
const startBtn = document.getElementById("start-course");
const stopBtn = document.getElementById("stop-course");
const timerDisplay = document.getElementById("timer");
const dureeInput = document.getElementById("duree-course");
const distanceInput = document.getElementById("distance-tour");

// ----------- Timer -----------
function startTimer() {
  let duree = parseInt(dureeInput.value) * 60;
  tempsRestant = duree;
  courseActive = true;
  updateTimerDisplay();
  startBtn.disabled = true;
  stopBtn.disabled = false;

  timerInterval = setInterval(() => {
    if (tempsRestant <= 0) {
      stopTimer();
      return;
    }
    tempsRestant--;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  courseActive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

function updateTimerDisplay() {
  let minutes = Math.floor(tempsRestant / 60);
  let secondes = tempsRestant % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(secondes).padStart(2, "0")}`;
}

// ----------- Gestion élèves -----------
function renderEleves() {
  elevesContainer.innerHTML = "";
  eleves.forEach((eleve, index) => {
    const box = document.createElement("div");
    box.classList.add("eleve-box");
    box.innerHTML = `
      <h3>${eleve.nom}</h3>
      <p>Tours : ${eleve.tours}</p>
      <p>Distance : ${eleve.tours * distanceTour} m</p>
      <button onclick="ajouterTour(${index})">+1 Tour</button>
      <button onclick="retirerTour(${index})">-1 Tour</button>
    `;
    elevesContainer.appendChild(box);
  });
}

function ajouterTour(index) {
  eleves[index].tours++;
  renderEleves();
}

function retirerTour(index) {
  if (eleves[index].tours > 0) {
    eleves[index].tours--;
    renderEleves();
  }
}

function ajouterEleve() {
  const nom = prompt("Nom de l'élève ?");
  if (nom) {
    eleves.push({ nom: nom, tours: 0 });
    renderEleves();
  }
}

function resetEleves() {
  if (confirm("Réinitialiser tous les élèves ?")) {
    eleves = [];
    renderEleves();
  }
}

// ----------- QR Code -----------
function genererQRCode() {
  const url = window.location.href;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 128,
    height: 128
  });
}

// ----------- Sauvegarde Données -----------
function sauvegarderDonnees() {
  const data = {
    eleves: eleves,
    distanceTour: distanceTour,
    date: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_course.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ----------- Listeners -----------
startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
document.getElementById("add-eleve-btn").addEventListener("click", ajouterEleve);
document.getElementById("reset-eleves-btn").addEventListener("click", resetEleves);
document.getElementById("save-data-btn").addEventListener("click", sauvegarderDonnees);
distanceInput.addEventListener("input", () => {
  distanceTour = parseInt(distanceInput.value) || 400;
  renderEleves();
});

// Initialisation
genererQRCode();
renderEleves();
