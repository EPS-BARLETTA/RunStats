const demarrerBtn = document.getElementById("demarrer");
const resetBtn = document.getElementById("reset");
const plusTourBtn = document.getElementById("plusTour");
const courseSection = document.getElementById("course-section");
const saisieContainer = document.getElementById("saisie-container");

const nom1 = document.getElementById("nom1");
const prenom1 = document.getElementById("prenom1");
const classe1 = document.getElementById("classe1");
const sexe1 = document.getElementById("sexe1");

const nom2 = document.getElementById("nom2");
const prenom2 = document.getElementById("prenom2");
const classe2 = document.getElementById("classe2");
const sexe2 = document.getElementById("sexe2");

const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaInput = document.getElementById("vma");

const currentCoureurDisplay = document.getElementById("currentCoureurDisplay");
const minuteurDiv = document.getElementById("minuteur");

const distanceParcourueDiv = document.getElementById("distanceParcourue");
const vitesseDiv = document.getElementById("vitesse");
const vmaEstimeeDiv = document.getElementById("vmaEstimee");
const nombreToursDiv = document.getElementById("nombreTours");

let dureeCourse = 0; // en secondes
let distanceTour = 0;
let vmaConnu = 0;

let timerInterval = null;
let tempsRestant = 0;

let tours = 0;
let distanceParcourue = 0;

let courseActive = false;

let coureurActuel = 1;
let coursesRealisees = 0;

function afficherInfosCourse() {
  distanceParcourueDiv.textContent = `Distance parcourue: ${distanceParcourue.toFixed(2)} m`;
  const vitesse = tours > 0 ? (distanceParcourue / ((dureeCourse - tempsRestant) / 3600)) : 0; // km/h
  vitesseDiv.textContent = `Vitesse: ${vitesse.toFixed(2)} km/h`;
  const vmaEstimee = vitesse; // estimation simple, peut être améliorée
  vmaEstimeeDiv.textContent = `VMA estimée: ${vmaEstimee.toFixed(2)} km/h`;
  nombreToursDiv.textContent = `Nombre de tours: ${tours}`;
}

function startMinuteur() {
  tempsRestant = dureeCourse;
  minuteurDiv.textContent = formatTemps(tempsRestant);
  minuteurDiv.style.color = "black";

  timerInterval = setInterval(() => {
    tempsRestant--;
    minuteurDiv.textContent = formatTemps(tempsRestant);

    if (tempsRestant <= 10) {
      minuteurDiv.style.color = tempsRestant % 2 === 0 ? "red" : "black"; // clignotement rouge
    } else {
      minuteurDiv.style.color = "black";
    }

    if (tempsRestant <= 0) {
      clearInterval(timerInterval);
      finCourse();
    }
  }, 1000);
}

function formatTemps(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}

function finCourse() {
  courseActive = false;
  plusTourBtn.style.display = "none";
  demarrerBtn.style.display = "inline-block";
  demarrerBtn.textContent = "Démarrer course suivante";

  // Afficher bouton pour rajouter 1/4, 1/2 ou 3/4 tour
  afficherBoutonsToursAdditionnels();
  alert(`Fin de la course du coureur ${coureurActuel}`);
}

function afficherBoutonsToursAdditionnels() {
  let container = document.getElementById("toursAdditionnelsContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toursAdditionnelsContainer";
    container.style.marginTop = "15px";
    container.style.textAlign = "center";

    ["1/4", "1/2", "3/4"].forEach(frac => {
      const btn = document.createElement("button");
      btn.textContent = `Ajouter ${frac} tour`;
      btn.style.margin = "0 5px";
      btn.addEventListener("click", () => {
        const fraction = parseFraction(frac);
        ajouterToursAdditionnels(fraction);
        container.remove();
      });
      container.appendChild(btn);
    });

    courseSection.appendChild(container);
  }
}

function parseFraction(frac) {
  if(frac === "1/4") return 0.25;
  if(frac === "1/2") return 0.5;
  if(frac === "3/4") return 0.75;
  return 0;
}

function ajouterToursAdditionnels(fraction) {
  const distanceAAjouter = distanceTour * fraction;
  distanceParcourue += distanceAAjouter;
  afficherInfosCourse();
}

demarrerBtn.addEventListener("click", () => {
  if (courseActive) return;

  // Validation des saisies
  if (!nom1.value || !prenom1.value || !classe1.value || !sexe1.value) {
    alert("Veuillez renseigner toutes les informations de l'élève 1.");
    return;
  }
  if (!nom2.value || !prenom2.value || !classe2.value || !sexe2.value) {
    alert("Veuillez renseigner toutes les informations de l'élève 2.");
    return;
  }
  if (!dureeInput.value || !distanceTourInput.value) {
    alert("Veuillez renseigner la durée et la distance du tour.");
    return;
  }

  dureeCourse = parseInt(dureeInput.value, 10) * 60; // minutes → secondes
  distanceTour = parseFloat(distanceTourInput.value);
  vmaConnu = vmaInput.value ? parseFloat(vmaInput.value) : 0;

  tours = 0;
  distanceParcourue = 0;
  tempsRestant = dureeCourse;

  saisieContainer.style.display = "none";
  courseSection.style.display = "block";
  plusTourBtn.style.display = "inline-block";

  courseActive = true;
  afficherInfosCourse();

  currentCoureurDisplay.textContent = `Coureur : ${coureurActuel}`;
  demarrerBtn.style.display = "none";

  startMinuteur();
});

plusTourBtn.addEventListener("click", () => {
  if (!courseActive) return;
  tours++;
  distanceParcourue += distanceTour;
  afficherInfosCourse();
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
