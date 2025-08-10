// course.js — complet
let coureurActuel = 1;
let nombreTours = 0;
let timerInterval = null;
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
const titleEl = document.getElementById("title");

// Données élèves depuis la saisie (sessionStorage)
const eleve1 = JSON.parse(sessionStorage.getItem("eleve1Data") || "{}");
const eleve2 = JSON.parse(sessionStorage.getItem("eleve2Data") || "{}");

const longueur1 = Number(eleve1.longueurTour || eleve1.longueur || eleve1.distanceTour || 0);
const longueur2 = Number(eleve2.longueurTour || eleve2.longueur || eleve2.distanceTour || 0);
const duree1Min = Number(eleve1.temps || eleve1.duree || eleve1.dureeMin || 0);
const duree2Min = Number(eleve2.temps || eleve2.duree || eleve2.dureeMin || 0);

// État courant (selon coureurActuel)
let longueur = longueur1;
let duree = duree1Min; // en minutes
let totalSeconds = Math.round(duree * 60);
let elapsed = 0; // secondes écoulées

function formatTime(s){
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function setUIForRunner(){
  const e = (coureurActuel === 1) ? eleve1 : eleve2;
  longueur = (coureurActuel === 1) ? longueur1 : longueur2;
  duree = (coureurActuel === 1) ? duree1Min : duree2Min;
  totalSeconds = Math.max(1, Math.round(duree * 60));
  elapsed = 0;
  nombreTours = 0;

  // Titre + couleurs de fond (bleu élève 1 / vert élève 2)
  titleEl.textContent = `Course de ${e.prenom || ""} ${e.nom || ""}`;
  document.body.style.backgroundColor = (coureurActuel === 1) ? "#dfeeff" : "#e6ffe6";

  // Réinitialise affichage
  timerDisplay.textContent = formatTime(totalSeconds);
  lapsDisplay.textContent = "0";
  distanceDisplay.textContent = "0";
  vitesseDisplay.textContent = "0.00";
  vmaDisplay.textContent = "0.00";

  nextBtn.style.display = "none";
  summaryBtn.style.display = "none";
  lapBtn.disabled = false;
}

function updateLiveMetrics(){
  // Distance courante
  const distance = nombreTours * longueur; // en mètres
  const v = (elapsed > 0) ? ( (distance/1000) / (elapsed/3600) ) : 0; // km/h
  const vma = v * 1.15; // proxy

  lapsDisplay.textContent = String(nombreTours);
  distanceDisplay.textContent = String(Math.round(distance));
  vitesseDisplay.textContent = v.toFixed(2);
  vmaDisplay.textContent = vma.toFixed(2);
}

function demarrerChrono(){
  if(isRunning) return;
  isRunning = true;

  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(totalSeconds - elapsed <= 0){
      terminerCourse();
      return;
    }
    elapsed += 1;
    const restant = totalSeconds - elapsed;
    timerDisplay.textContent = formatTime(restant);

    // clignote les 10 dernières secondes
    if(restant <= 10){
      timerDisplay.style.visibility = (timerDisplay.style.visibility === "hidden") ? "visible" : "hidden";
    } else {
      timerDisplay.style.visibility = "visible";
    }

    updateLiveMetrics();
  }, 1000);
}

function enregistrerStats(){
  // enregistre l'élément dans stats avec valeurs actuelles (sans fraction)
  const e = (coureurActuel === 1) ? eleve1 : eleve2;
  const distance = nombreTours * longueur;
  const v = (elapsed > 0) ? ( (distance/1000) / (elapsed/3600) ) : 0;
  const vma = v * 1.15;

  stats.push({
    nom: e.nom, prenom: e.prenom, classe: e.classe, sexe: e.sexe,
    distance: Math.round(distance),
    vitesse: parseFloat(v.toFixed(2)),
    vma: parseFloat(vma.toFixed(2)),
    temps: totalSeconds // durée totale pour cet élève (utile au résumé / corrections)
  });
}

function terminerCourse(){
  clearInterval(timerInterval);
  isRunning = false;
  lapBtn.disabled = true;
  timerDisplay.style.visibility = "visible"; // au cas où ça clignote

  // 1) on enregistre l'état à la fin du chrono
  enregistrerStats();

  // 2) propose la fraction si fraction.js est présent
  const eleve = stats[stats.length - 1];
  if (typeof ajouterFraction === "function"){
    ajouterFraction(eleve, longueur).then((eleveMaj)=>{
      // MAJ dans stats
      stats[stats.length - 1] = eleveMaj;

      // MAJ visuelle immédiate
      distanceDisplay.textContent = String(eleveMaj.distance);
      vitesseDisplay.textContent = parseFloat(eleveMaj.vitesse || 0).toFixed(2);
      vmaDisplay.textContent = parseFloat(eleveMaj.vma || 0).toFixed(2);

      // Bouton suivant / résumé
      if(coureurActuel === 1){
        nextBtn.style.display = "inline-block";
      }else{
        summaryBtn.style.display = "inline-block";
      }
    });
  } else {
    if(coureurActuel === 1){
      nextBtn.style.display = "inline-block";
    }else{
      summaryBtn.style.display = "inline-block";
    }
  }
}

// Bouton tour
lapBtn.addEventListener("click", ()=>{
  if(!isRunning) return;
  nombreTours += 1;
  updateLiveMetrics();
});

// Passer au coureur 2
nextBtn.addEventListener("click", ()=>{
  coureurActuel = 2;
  setUIForRunner();
  demarrerChrono();
});

// Aller au résumé
summaryBtn.addEventListener("click", ()=>{
  sessionStorage.setItem("stats", JSON.stringify(stats));
  window.location.href = "resume.html";
});

// Boot
window.addEventListener("load", ()=>{
  // S'il manque des données élèves, on évite les erreurs
  if(!eleve1 || !eleve1.prenom || !eleve2 || !eleve2.prenom){
    titleEl.textContent = "Course — données élèves manquantes";
    lapBtn.disabled = true;
    return;
  }
  setUIForRunner();
  demarrerChrono();
});
