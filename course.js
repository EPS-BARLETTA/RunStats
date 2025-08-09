// course.js — 2 coureurs, fraction en fin de course, pause avant course 2, titre = Prénom Nom
(function () {
  // === Helpers: vitesse (km/h) & VMA normalisée 6 min ===
  function kmh(distance_m, time_s) {
    if (!isFinite(distance_m) || !isFinite(time_s) || time_s <= 0) return 0;
    return (distance_m / time_s) * 3.6;
  }
  // Auto-détection minutes vs secondes (si <= 20 on suppose minutes)
  function kmhSmart(distance_m, time_val) {
    if (!isFinite(distance_m) || !isFinite(time_val) || time_val <= 0) return 0;
    const time_s = (time_val <= 20) ? time_val * 60 : time_val;
    return kmh(distance_m, time_s);
  }
  function vmaEquiv6min(distance_m, time_s) {
    if (!isFinite(distance_m) || !isFinite(time_s) || time_s <= 0) return 0;
    const tMin = Math.max(0.5, time_s / 60);
    const v = kmh(distance_m, time_s);
    const a = 0.06; // exposant doux
    const v6 = v * Math.pow(tMin / 6, a);
    return Math.round(v6 * 100) / 100;
  }
  function vmaEquiv6minSmart(distance_m, time_val) {
    if (!isFinite(distance_m) || !isFinite(time_val) || time_val <= 0) return 0;
    const time_s = (time_val <= 20) ? time_val * 60 : time_val;
    return vmaEquiv6min(distance_m, time_s);
  }

  // ----- Récup des données de départ (avec garde-fous) -----
  var eleve1 = safeParse(sessionStorage.getItem("eleve1")) || {};
  var eleve2 = safeParse(sessionStorage.getItem("eleve2")) || {};
  var dureeCourse = parseFloat(sessionStorage.getItem("dureeCourse")); // minutes
  if (!isFinite(dureeCourse) || dureeCourse <= 0) dureeCourse = 3; // défaut test
  var longueurTour = parseFloat(sessionStorage.getItem("longueurTour"));
  if (!isFinite(longueurTour) || longueurTour <= 0) {
    longueurTour = parseFloat(sessionStorage.getItem("lapLength"));
    if (!isFinite(longueurTour) || longueurTour <= 0) longueurTour = 100; // défaut test
  }

  // fallbacks pour titre si ouverture directe
  eleve1.nom = eleve1.nom || "Élève";
  eleve1.prenom = eleve1.prenom || "1";
  eleve2.nom = eleve2.nom || "Élève";
  eleve2.prenom = eleve2.prenom || "2";

  // Stats (pour résumé)
  var stats = [{}, {}];

  // ----- Éléments UI -----
  var titleEl   = byId("title");
  var timerEl   = byId("timer");
  var lapsEl    = byId("laps");
  var distEl    = byId("distance");
  var vitEl     = byId("vitesse");
  var vmaEl     = byId("vma");
  var lapBtn    = byId("lapBtn");
  var nextBtn   = byId("nextBtn");
  var summaryBtn= byId("summaryBtn");

  // État courant
  var currentRunner = 0; // 0 => élève 1, 1 => élève 2
  var laps = 0;
  var distance = 0; // m
  var totalSeconds = Math.round(dureeCourse * 60); // compte à rebours
  var intervalId = null;
  var readyToStartRunner2 = false; // pause après course 1

  // ----- Initialisation -----
  updateHeader();
  resetRunnerDisplay();
  startTimer();

  lapBtn.disabled = false;
  nextBtn.style.display = "none";
  summaryBtn.style.display = "none";

  // ----- Handlers -----
  lapBtn.addEventListener("click", function () {
    laps += 1;
    distance = laps * longueurTour;
    updateNumbers();
  });

  // Bouton "Suivant" (pause après fin coureur 1)
  nextBtn.addEventListener("click", function () {
    if (!readyToStartRunner2) {
      // On finalise coureur 1 (avec fraction) mais on ne lance pas la course 2 tout de suite
      finalizeCurrentRunner().then(function () {
        readyToStartRunner2 = true;
        nextBtn.textContent = "Lancer la course 2";
      });
    } else {
      // Lancer la course 2
      readyToStartRunner2 = false;
      nextBtn.textContent = "Suivant";
      currentRunner = 1;
      laps = 0;
      distance = 0;
      totalSeconds = Math.round(dureeCourse * 60);
      resetRunnerDisplay();
      updateHeader();
      startTimer();
      nextBtn.style.display = "none";
    }
  });

  // Bouton "Résumé" (fin coureur 2)
  summaryBtn.addEventListener("click", function () {
    finalizeCurrentRunner().then(function () {
      // Sauvegarde finale des stats & envoi vers le résumé
      sessionStorage.setItem("stats", JSON.stringify(stats));
      // Redirection vers la page de résumé (adapter si besoin)
      window.location.href = "summary.html";
    });
  });

  // ----- Timer -----
  function startTimer() {
    clearInterval(intervalId);
    intervalId = setInterval(function () {
      totalSeconds -= 1;
      if (totalSeconds <= 0) {
        totalSeconds = 0;
        timerEl.textContent = formatTime(totalSeconds);
        clearInterval(intervalId);
        lapBtn.disabled = true;

        // Fin de la course pour ce coureur → on affiche le bon bouton
        if (currentRunner === 0) {
          // coureur 1 : montrer "Suivant" (puis “Lancer la course 2” après fraction)
          nextBtn.style.display = "inline-block";
          nextBtn.textContent = "Suivant";
        } else {
          // coureur 2 : montrer "Résumé"
          summaryBtn.style.display = "inline-block";
        }
      }
      timerEl.textContent = formatTime(totalSeconds);
      updateNumbers();
    }, 1000);
  }

  function updateNumbers() {
    lapsEl.textContent = String(laps);
    distEl.textContent = String(Math.round(distance));

    // temps écoulé en minutes
    var elapsedMin = (Math.round(dureeCourse * 60) - totalSeconds) / 60;

    // vitesse instantanée en km/h (km/min * 60)
    var vitesse = elapsedMin > 0 ? ((distance / 1000) / elapsedMin) * 60 : 0;
    vitEl.textContent = vitesse.toFixed(2);

    // VMA instantanée estimée (normalisée 6 min) sur le temps écoulé
    var vmaInst = elapsedMin > 0 ? vmaEquiv6minSmart(distance, elapsedMin) : 0;
    var vmaSource = (currentRunner === 0 ? eleve1.vma : eleve2.vma);
    var vmaAff = (isFinite(vmaSource) && vmaSource > 0) ? vmaSource : vmaInst;
    vmaEl.textContent = (isFinite(vmaAff) ? vmaAff : 0).toFixed(2);
  }

  function resetRunnerDisplay() {
    updateHeader();
    timerEl.textContent = formatTime(totalSeconds);
    lapsEl.textContent = "0";
    distEl.textContent = "0";
    vitEl.textContent = "0.00";
    vmaEl.textContent = "0.00";
    lapBtn.disabled = false;
    nextBtn.style.display = (currentRunner === 0) ? "none" : "none";
    summaryBtn.style.display = (currentRunner === 1) ? "none" : "none";
  }

  function updateHeader() {
    var nom = currentRunner === 0 ? (eleve1.nom || "") : (eleve2.nom || "");
    var prenom = currentRunner === 0 ? (eleve1.prenom || "") : (eleve2.prenom || "");
    var label = (prenom || nom) ? (prenom + " " + nom).trim() : (currentRunner === 0 ? "Élève 1" : "Élève 2");
    titleEl.textContent = label;
  }

  // Appelé quand un coureur a terminé (timer à 0 et clic sur Suivant/Résumé)
  function finalizeCurrentRunner() {
    return new Promise(function (resolve) {
      var runnerIndex = currentRunner;
      var elapsedMin = dureeCourse; // on a chronométré en compte à rebours
      // vitesse finale brute (km/h) sur la durée choisie
      var vitesseFin = kmhSmart(distance, elapsedMin);
      // VMA de départ éventuellement fournie
      var vmaInit = runnerIndex === 0 ? toNum(eleve1.vma) : toNum(eleve2.vma);
      var vmaEst = isFinite(vmaInit) && vmaInit > 0 ? vmaInit : vmaEquiv6minSmart(distance, elapsedMin);

      // Objet élève pour passer à la fenêtre de fraction
      var eleveCalc = {
        nom:    runnerIndex === 0 ? (eleve1.nom || "")    : (eleve2.nom || ""),
        prenom: runnerIndex === 0 ? (eleve1.prenom || "") : (eleve2.prenom || ""),
        classe: runnerIndex === 0 ? (eleve1.classe || "") : (eleve2.classe || ""),
        sexe:   runnerIndex === 0 ? (eleve1.sexe || "")   : (eleve2.sexe || ""),
        distance: distance,          // m
        temps:    elapsedMin,        // minutes
        vitesse:  vitesseFin,        // km/h
        vma:      vmaEst             // km/h
      };

      // Ouvre la UI de fraction (définie dans fraction.js, chargé avant)
      if (typeof window.ajouterFraction !== "function") {
        console.error("ajouterFraction introuvable — vérifie que fraction.js est chargé avant course.js");
        // on poursuit quand même
        afterFraction(eleveCalc);
        return resolve();
      }

      window.ajouterFraction(eleveCalc, longueurTour).then(function (eleveMaj) {
        afterFraction(eleveMaj);
        resolve();
      });

      function afterFraction(e) {
        // Recalcule vitesse & VMA après ajout de fraction
        e.vitesse = kmhSmart(e.distance, e.temps);
        var vmaSource = (runnerIndex === 0 ? eleve1.vma : eleve2.vma);
        e.vma = (isFinite(vmaSource) && vmaSource > 0) ? vmaSource : vmaEquiv6minSmart(e.distance, e.temps);

        // Rafraîchit l'affichage après ajout de fraction
        try {
          distEl.textContent = String(Math.round(e.distance));
          vitEl.textContent = (e.vitesse).toFixed(2);
          vmaEl.textContent = (e.vma).toFixed(2);
        } catch (err) {}

        // Stocke dans stats
        stats[runnerIndex] = {
          nom: e.nom,
          prenom: e.prenom,
          classe: e.classe,
          sexe: e.sexe,
          distance: Math.round(e.distance * 100) / 100,
          vitesse:  Math.round(e.vitesse  * 100) / 100,
          vma:      Math.round(e.vma      * 100) / 100
        };

        // Sauvegarde intermédiaire
        sessionStorage.setItem("stats", JSON.stringify(stats));
      }
    });
  }

  // ----- Utils -----
  function byId(id) { return document.getElementById(id); }
  function safeParse(t) { try { return JSON.parse(t); } catch (e) { return null; } }
  function toNum(x){ const n = Number(x); return isNaN(n) ? NaN : n; }
  function formatTime(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }
})();
