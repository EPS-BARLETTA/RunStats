// course.js — v9 : Start one-shot par coureur + compat résumé/QR + pas d'autostart forcé
(function(){
  let coureurActuel = 1;   // 1 puis 2
  let phase = 1;           // 1 = course 1, 2 = course 2
  let nombreTours = 0;
  let timerInterval = null;
  let isRunning = false;
  let stats = [];

  // --- Paramètres d'URL ---
  const urlParams = new URLSearchParams(location.search);
  const URL_RUNNER    = parseInt(urlParams.get('runner') || '1', 10);   // 1 ou 2
  const URL_AUTOSTART = urlParams.get('autostart') !== '0';             // true = auto

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
  const startBtnEl = document.getElementById("startBtn"); // bouton rond dans course.html

  if (summaryBtn) summaryBtn.textContent = "Passer au résumé";

  // Minuteur rond (si présent)
  const ringFG   = document.getElementById("ringFG");
  const ringWrap = document.getElementById("ringWrap");
  const HAS_RING = !!(ringFG && ringWrap);
  let CIRC = 1;
  if (HAS_RING) {
    const R = 96;
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

  // État courant (mis à jour par setUIForRunner)
  let longueur = longueur1;
  let duree    = duree1Min;
  let totalSeconds = 60; // placeholder
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
      timerDisplay.style.visibility = on
        ? (timerDisplay.style.visibility === "hidden" ? "visible" : "hidden")
        : "visible";
    }
  }

  function enableStart(){
    if (startBtnEl) {
      startBtnEl.disabled = false;
      startBtnEl.setAttribute('aria-disabled', 'false');
    }
  }
  function disableStart(){
    if (startBtnEl) {
      startBtnEl.disabled = true;
      startBtnEl.setAttribute('aria-disabled', 'true');
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

    // Start réactivé au début de chaque coureur, et sera désactivé après clic et en fin de course
    enableStart();
    isRunning = false;
  }

  function updateLiveMetrics(){
    const distance = nombreTours * longueur; // m
    const v = (elapsed > 0) ? ((distance/1000) / (elapsed/3600)) : 0; // km/h
    const vma = v * 1.15;

    lapsDisplay.textContent      = String(nombreTours);
    distanceDisplay.textContent  = String(Math.round(distance));
    vitesseDisplay.textContent   = v.toFixed(2);
    vmaDisplay.textContent       = v.toFixed(2);
  }

  function demarrerChrono(){
    if(isRunning) return;
    isRunning = true;
    disableStart(); // one-shot : désactive Start dès le lancement
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

  // Expose une API pour le bouton "Start" (dans course.html)
  window.startCourse = function(){
    demarrerChrono();
  };

  // Permet aussi d'écouter un événement custom si besoin
  document.addEventListener('runstats:start', () => demarrerChrono());

  function enregistrerStats(){
    const e = (coureurActuel === 1) ? eleve1 : eleve2;
    const distance = nombreTours * longueur;
    const v = (elapsed > 0) ? ((distance/1000) / (elapsed/3600)) : 0;
    const vma = v * 1.15;

    const record = {
      nom: e.nom, prenom: e.prenom, classe: e.classe, sexe: e.sexe,
      distance: Math.round(distance),
      vitesse: parseFloat(v.toFixed(2)),
      vma: parseFloat(vma.toFixed(2)),
      temps: Math.max(1, Math.round(duree * 60)) // s (durée prévue)
    };

    // Empêche doublons si on a déjà stocké ce coureur (sécurité)
    if (coureurActuel === 1) {
      stats[0] = record;
      // Compat descendante pour resume.html / Mode prof
      sessionStorage.setItem('result1', JSON.stringify(record));
      sessionStorage.setItem('eleve1Result', JSON.stringify(record));
    } else {
      stats[1] = record;
      sessionStorage.setItem('result2', JSON.stringify(record));
      sessionStorage.setItem('eleve2Result', JSON.stringify(record));
    }

    // Tableau global (beaucoup de résumés l’utilisent)
    sessionStorage.setItem('stats', JSON.stringify(stats));

    // On s’assure que les données brutes des élèves existent (déjà posées par la saisie)
    sessionStorage.setItem('eleve1Data', JSON.stringify(eleve1 || {}));
    sessionStorage.setItem('eleve2Data', JSON.stringify(eleve2 || {}));
  }

  function terminerCourse(){
    clearInterval(timerInterval);
    isRunning = false;
    lapBtn.disabled = true;
    setDanger(false);
    disableStart(); // empêche de relancer la même course

    enregistrerStats();
    const idx = stats.length - 1;
    const eleve = stats[idx];

    const suiteApresMaj = () => {
      if (phase === 1) {
        // Fin course 1 : proposer d'aller au coureur 2 (sans démarrer)
        nextBtn.style.display = "inline-block";
        summaryBtn.style.display = "none";
      } else {
        // Fin course 2 : proposer uniquement le résumé / QR
        nextBtn.style.display = "none";
        summaryBtn.style.display = "inline-block";
      }
    };

    // Fraction (si dispo)
    if (typeof ajouterFraction === "function"){
      try {
        ajouterFraction(eleve, longueur).then((eleveMaj)=>{
          // MAJ des résultats finaux
          stats[idx] = eleveMaj;

          // MAJ visuelle
          distanceDisplay.textContent = String(eleveMaj.distance);
          vitesseDisplay.textContent  = parseFloat(eleveMaj.vitesse || 0).toFixed(2);
          vmaDisplay.textContent      = parseFloat(eleveMaj.vma || 0).toFixed(2);

          // Remets les clés compatibles avec la MAJ
          if (phase === 1) {
            sessionStorage.setItem('result1', JSON.stringify(eleveMaj));
            sessionStorage.setItem('eleve1Result', JSON.stringify(eleveMaj));
          } else {
            sessionStorage.setItem('result2', JSON.stringify(eleveMaj));
            sessionStorage.setItem('eleve2Result', JSON.stringify(eleveMaj));
          }
          sessionStorage.setItem('stats', JSON.stringify(stats));

          suiteApresMaj();
        }).catch(()=>suiteApresMaj());
      } catch {
        suiteApresMaj();
      }
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

  // NEXT : accéder au coureur 2 sans démarrer
  nextBtn.addEventListener("click", ()=>{
    // Option 1 : recharger avec URL visible
    // location.href = 'course.html?runner=2&autostart=0';

    // Option 2 : basculer l'UI localement (fluide) — on garde celle-ci
    phase = 2;
    coureurActuel = 2;
    setUIForRunner();     // réactive Start pour le coureur 2
    // NE PAS démarrer ici : attendre le bouton Start
  });

  summaryBtn.addEventListener("click", ()=>{
    // S'assure que stats, result1/result2 et datas sont bien posés :
    sessionStorage.setItem("stats", JSON.stringify(stats || []));
    if (stats[0]) {
      sessionStorage.setItem("result1", JSON.stringify(stats[0]));
      sessionStorage.setItem("eleve1Result", JSON.stringify(stats[0]));
    }
    if (stats[1]) {
      sessionStorage.setItem("result2", JSON.stringify(stats[1]));
      sessionStorage.setItem("eleve2Result", JSON.stringify(stats[1]));
    }
    sessionStorage.setItem("eleve1Data", JSON.stringify(eleve1 || {}));
    sessionStorage.setItem("eleve2Data", JSON.stringify(eleve2 || {}));

    window.location.href = "resume.html"; // adapte si nom différent
  });

  // Boot
  window.addEventListener("load", ()=>{
    if(!eleve1 || !eleve1.prenom || !eleve2 || !eleve2.prenom){
      titleEl.textContent = "Course — données coureurs manquantes";
      lapBtn.disabled = true;
      disableStart();
      return;
    }
    // Runner initial depuis l'URL
    coureurActuel = (URL_RUNNER === 2) ? 2 : 1;
    phase = (coureurActuel === 2) ? 2 : 1;

    setUIForRunner();

    // Autostart seulement si demandé (autostart != 0)
    if (URL_AUTOSTART) {
      demarrerChrono();
    }
  });
})();
