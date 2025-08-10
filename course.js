// course.js — robuste + auto-résumé après la course 2
(function(){
  let coureurActuel = 1;
  let nombreTours = 0;
  let timerInterval = null;
  let isRunning = false;
  let stats = [];

  // UI
  const timerDisplay    = document.getElementById("timer");
  const lapsDisplay     = document.getElementById("laps");
  const distanceDisplay = document.getElementById("distance");
  const vitesseDisplay  = document.getElementById("vitesse");
  const vmaDisplay      = document.getElementById("vma");

  const lapBtn     = document.getElementById("lapBtn");
  const nextBtn    = document.getElementById("nextBtn");
  const summaryBtn = document.getElementById("summaryBtn");
  const titleEl    = document.getElementById("title");

  // Minuteur rond (si présent)
  const ringFG   = document.getElementById("ringFG");
  const ringWrap = document.getElementById("ringWrap");
  const HAS_RING = !!(ringFG && ringWrap);
  let CIRC = 1;
  if (HAS_RING) {
    const R = 96; // rayon du cercle dans le SVG
    CIRC = 2 * Math.PI * R;
    ringFG.style.strokeDasharray = String(CIRC);
    ringFG.style.strokeDashoffset = "0";
  }

  // Données élèves
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1Data") || "{}");
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2Data") || "{}");

  const longueur1 = Number(eleve1.longueurTour || 0);
  const longueur2 = Number(eleve2.longueurTour || 0);
  const duree1Min = Number(eleve1.temps || 0);
  const duree2Min = Number(eleve2.temps || 0);

  // État courant
  let longueur = longueur1;
  let duree    = duree1Min;
  let totalSeconds = Math.max(1, Math.round(duree * 60));
  let elapsed  = 0;

  function formatTime(s){
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
  }

  function setRingProgress(){
    if (!HAS_RING) return;
    const progress = Math.min(1, Math.max(0, elapsed / totalSeconds)); // 0→1
    ringFG.style.strokeDashoffset = String(CIRC * progress);
  }

  function setDanger(on){
    if (HAS_RING) {
      if (on) ringWrap.classList.add("danger");
      else    ringWrap.classList.remove("danger");
    } else {
      // Fallback visuel si pas d'anneau : clignote le texte en fin
      timerDisplay.style.visibility = on
        ? (timerDisplay.style.visibility === "hidden" ? "visible" : "hidden")
        : "visible";
    }
  }

  function setUIForRunner(){
    const e = (coureurActuel === 1) ? eleve1 : eleve2;
    longueur = (coureurActuel === 1) ? longueur1 : longueur2;
    duree    = (coureurActuel === 1) ? duree1Min : duree2Min;
    totalSeconds = Math.max(1, Math.round(duree * 60));
    elapsed = 0; nombreTours = 0;

    titleEl.textContent = `Course de ${e.prenom || ""} ${e.nom || ""}`;
    document.body.style.backgroundColor = (coureurActuel === 1) ? "#dfeeff" : "#e6ffe6";

    timerDisplay.textContent = formatTime(totalSeconds);
    lapsDisplay.textContent  = "0";
    distanceDisplay.textContent = "0";
    vitesseDisplay.textContent  = "0.00";
    vmaDisplay.textContent      = "0.00";

    nextBtn.style.display    = "none";
    summaryBtn.style.display = "none";
    lapBtn.disabled = false;

    setDanger(false);
    setRingProgress();
  }

  function updateLiveMetrics(){
    const distance = nombreTours * longueur; // m
    const v = (elapsed > 0) ? ( (distance/1000) / (elapsed/3600) ) : 0; // km/h
    const vma = v * 1.15;

    lapsDisplay.textContent      = String(nombreTours);
    distanceDisplay.textContent  = String(Math.round(distance));
    vitesseDisplay.textContent   = v.toFixed(2);
    vmaDisplay.textContent       = v.toFixed(2);
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
      setRingProgress();
      setDanger(restant <= 10);

      updateLiveMetrics();
    }, 1000);
  }

  function enregistrerStats(){
    const e = (coureurActuel === 1) ? eleve1 : eleve2;
    const distance = nombreTours * longueur;
    const v = (elapsed > 0) ? ( (distance/1000) / (elapsed/3600) ) : 0;
    const vma = v * 1.15;

    stats.push({
      nom: e.nom, prenom: e.prenom, classe: e.classe, sexe: e.sexe,
      distance: Math.round(distance),
      vitesse: parseFloat(v.toFixed(2)),
      vma: parseFloat(vma.toFixed(2)),
      temps: Math.max(1, Math.round(duree * 60)) // durée paramétrée en s
    });
  }

  // >>> Fin de course : fraction + enchaînement
  function terminerCourse(){
    clearInterval(timerInterval);
    isRunning = false;
    lapBtn.disabled = true;
    setDanger(false);

    // Enregistre l'état avant fraction
    enregistrerStats();

    const eleve = stats[stats.length - 1];

    // Suite après MAJ (selon coureur)
    const suiteApresMaj = () => {
      if (coureurActuel === 1) {
        // Fin course 1 : afficher "Passer au coureur 2"
        nextBtn.style.display = "inline-block";
      } else {
        // Fin course 2 : enregistrer et aller au résumé automatiquement
        sessionStorage.setItem("stats", JSON.stringify(stats));
        setTimeout(() => { window.location.href = "resume.html"; }, 400);
        // Si tu préfères un bouton à la place :
        // summaryBtn.style.display = "inline-block";
      }
    };

    // Proposer la fraction si disponible
    if (typeof ajouterFraction === "function"){
      ajouterFraction(eleve, longueur).then((eleveMaj)=>{
        stats[stats.length - 1] = eleveMaj; // MAJ des résultats finaux

        // MAJ visuelle immédiate
        distanceDisplay.textContent = String(eleveMaj.distance);
        vitesseDisplay.textContent  = parseFloat(eleveMaj.vitesse || 0).toFixed(2);
        vmaDisplay.textContent      = parseFloat(eleveMaj.vma || 0).toFixed(2);

        suiteApresMaj();
      });
    } else {
      suiteApresMaj();
    }
  }

  // Écouteurs
  lapBtn.addEventListener("click", ()=>{
    if(!isRunning) return;
    nombreTours += 1;
    updateLiveMetrics();
  });

  nextBtn.addEventListener("click", ()=>{
    coureurActuel = 2;
    setUIForRunner();
    demarrerChrono();
  });

  summaryBtn.addEventListener("click", ()=>{
    sessionStorage.setItem("stats", JSON.stringify(stats));
    window.location.href = "resume.html";
  });

  // Boot
  window.addEventListener("load", ()=>{
    if(!eleve1 || !eleve1.prenom || !eleve2 || !eleve2.prenom){
      titleEl.textContent = "Course — données coureurs manquantes";
      lapBtn.disabled = true;
      return;
    }
    setUIForRunner();
    demarrerChrono();
  });
})();
