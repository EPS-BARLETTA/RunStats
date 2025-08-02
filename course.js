let tours = 0;
let debut;
let eleveData;
let chronoElement = document.getElementById("chronoCenter");
let circle = document.getElementById("progressCircle");
let duree;
let longueurTour;
let currentEleve;

function formatChrono(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateAffichage() {
  const now = Date.now();
  const elapsed = now - debut;
  const secondes = elapsed / 1000;
  const distance = tours * longueurTour;
  const vitesse = distance / secondes;
  const vmaEstimee = vitesse * 3.6;

  document.getElementById("chronoCenter").textContent = formatChrono(elapsed);
  document.getElementById("distance").textContent = distance.toFixed(0);
  document.getElementById("vitesse").textContent = vitesse.toFixed(2);
  document.getElementById("vmaEstimee").textContent = vmaEstimee.toFixed(1);

  const progress = Math.min(elapsed / (duree * 60000), 1);
  circle.style.strokeDashoffset = 283 * (1 - progress);

  if ((duree * 60 - secondes) <= 10) {
    chronoElement.classList.add("red");
  }

  if (elapsed < duree * 60000) {
    requestAnimationFrame(updateAffichage);
  } else {
    document.getElementById("ajouterTourBtn").disabled = true;
    document.getElementById("fin-course").classList.remove("hidden");
  }
}

function commencerCourse() {
  debut = Date.now();
  requestAnimationFrame(updateAffichage);
}

function chargerEleve() {
  currentEleve = sessionStorage.getItem("currentEleve") || "1";
  const eleveKey = currentEleve === "1" ? "eleve1Data" : "eleve2Data";
  const stored = sessionStorage.getItem(eleveKey);
  if (!stored) return window.location.href = "eleve.html";

  eleveData = JSON.parse(stored);

  document.getElementById("nomEleve").textContent = `${eleveData.prenom} ${eleveData.nom}`;
  duree = eleveData.temps;
  longueurTour = eleveData.longueurTour;

  commencerCourse();
}

document.getElementById("ajouterTourBtn").addEventListener("click", () => {
  tours++;
  document.getElementById("tours").textContent = tours;
});

document.querySelectorAll("#fin-course button[data-frac]").forEach(btn => {
  btn.addEventListener("click", () => {
    const frac = parseFloat(btn.getAttribute("data-frac"));
    tours += frac;
    document.getElementById("tours").textContent = tours.toFixed(2);
  });
});

document.getElementById("terminerBtn").addEventListener("click", () => {
  const now = Date.now();
  const dureeSec = (now - debut) / 1000;
  const distance = tours * longueurTour;
  const vitesse = distance / dureeSec;
  const vmaEstimee = vitesse * 3.6;

  const result = {
    nom: eleveData.nom,
    prenom: eleveData.prenom,
    classe: eleveData.classe,
    sexe: eleveData.sexe,
    distance: Math.round(distance),
    vitesse: vitesse,
    vmaEstimee: Math.round(vmaEstimee),
    vma: eleveData.vma
  };

  const resultKey = currentEleve === "1" ? "eleve1" : "eleve2";
  sessionStorage.setItem(resultKey, JSON.stringify(result));

  if (currentEleve === "1") {
    sessionStorage.setItem("currentEleve", "2");
    window.location.href = "course.html";
  } else {
    sessionStorage.removeItem("currentEleve");
    window.location.href = "summary.html";
  }
});

document.addEventListener("DOMContentLoaded", chargerEleve);
