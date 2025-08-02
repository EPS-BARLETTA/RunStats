let eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
let eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));

let currentEleve = sessionStorage.getItem("currentEleve") === "2" ? eleve2 : eleve1;
let tours = 0;
let tempsRestant = currentEleve.temps * 60;

const nomEleveSpan = document.getElementById("nomEleve");
const tempsSpan = document.getElementById("tempsRestant");
const toursSpan = document.getElementById("tours");
const ajouterBtn = document.getElementById("ajouterTourBtn");
const finSection = document.getElementById("fin-course");
const terminerBtn = document.getElementById("terminerBtn");

nomEleveSpan.textContent = `${currentEleve.prenom} ${currentEleve.nom}`;

const interval = setInterval(() => {
  if (tempsRestant > 0) {
    tempsRestant--;
    const minutes = Math.floor(tempsRestant / 60);
    const secondes = tempsRestant % 60;
    tempsSpan.textContent = `${minutes}m ${secondes}s`;
  } else {
    clearInterval(interval);
    finSection.classList.remove("hidden");
    ajouterBtn.disabled = true;
  }
}, 1000);

ajouterBtn.addEventListener("click", () => {
  tours++;
  toursSpan.textContent = tours;
});

document.querySelectorAll("#fin-course button[data-frac]").forEach(btn => {
  btn.addEventListener("click", () => {
    let frac = parseFloat(btn.getAttribute("data-frac"));
    tours += frac;
    toursSpan.textContent = tours;
    btn.disabled = true;
  });
});

terminerBtn.addEventListener("click", () => {
  currentEleve.distance = tours * currentEleve.longueurTour;
  currentEleve.vitesse = currentEleve.distance / (currentEleve.temps * 60);
  currentEleve.vmaEstimee = Math.round(currentEleve.vitesse * 3.6 * 10) / 10;

  if (sessionStorage.getItem("currentEleve") === "2") {
    // fin des deux courses
    sessionStorage.setItem("eleve2", JSON.stringify(currentEleve));
    window.location.href = "summary.html";
  } else {
    sessionStorage.setItem("eleve1", JSON.stringify(currentEleve));
    sessionStorage.setItem("currentEleve", "2");
    window.location.reload();
  }
});
