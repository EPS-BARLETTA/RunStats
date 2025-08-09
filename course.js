// course.js — 2 coureurs, ajout fraction à la fin de CHAQUE course, recalcul distance/vitesse/VMA

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

  // ----- Récup des données de départ -----
  var eleve1 = safeParse(sessionStorage.getItem("eleve1")) || {};
  var eleve2 = safeParse(sessionStorage.getItem("eleve2")) || {};
  var dureeCourse = parseFloat(sessionStorage.getItem("dureeCourse")); // minutes
  if (!isFinite(dureeCourse) || dureeCourse <= 0) dureeCourse = 6; // fallback 6 minutes

  // On tente de retrouver une "longueur de tour" saisie avant (plusieurs clés possibles)
  var longueurTour = pickFirstNumber(
    sessionStorage.getItem("longueurTour"),
    sessionStorage.getItem("lapLength"),
    sessionStorage.getItem("distanceParTour"),
    sessionStorage.getItem("tailleTour"),
    "400"
  );
  if (!isFinite(longueurTour) || longueurTour <= 0) longueurTour = 400;

  // Stats des 2 élèves que l’on remplira au fur et à mesure
  var stats = [
    { nom: eleve1.nom || "", prenom: eleve1.prenom || "", classe: eleve1.classe || "", sexe: eleve1.sexe || "", distance: 0, vitesse: 0, vma: eleve1.vma || 0 },
    { nom: eleve2.nom || "", prenom: eleve2.prenom || "", classe: eleve2.classe || "", sexe: eleve2.sexe || "", distance: 0, vitesse: 0, vma: eleve2.vma || 0 }
  ];

  // ----- Éléments UI -----
  var titleEl = byId("title");
  var timerEl = byId("timer");
  var lapsEl = byId("laps");
  var distEl = byId("distance");
  var vitEl = byId("vitesse");
  var vmaEl = byId("vma");
  var lapBtn = byId("lapBtn");
  var nextBtn = byId("nextBtn");
  var summaryBtn = byId("summaryBtn");

  // État courant
  var currentRunner = 0; // 0 => élève 1, 1 => élève 2
  var laps = 0;
  var distance = 0; // m
  var totalSeconds = Math.round(dureeCourse * 60); // compte à rebours
  var intervalId = null;

  // ----- Initialisation -----
  updateHeader();
  resetRunnerDisplay();
  startTimer();

  lapBtn.disabled = false;
  nextBtn.style.display = "none";
  summaryBtn.style.display = "none";

  lapBtn.addEventListener("click", function () {
    laps += 1;
    distance = laps * longueurTour;
    updateNumbers();
  });

  nextBtn.addEventListener("click", function () {
    // Fin élève 1 : on fige ses valeurs, propose fraction, recalcule, sauve dans stats[0]
    finalizeCurrentRunner().then(function () {
      // Passe à l’élève 2
      currentRunner = 1;
      laps = 0;
      distance = 0;
      totalSeconds = Math.round(dureeCourse * 60);
      resetRunnerDisplay();
      startTimer();
    });
  });

  summaryBtn.addEventListener("click", function () {
    // Fin élève 2 : propose fraction, recalcule, sauve dans stats[1], puis go résumé
    finalizeCurrentRunner().then(function () {
      // Sauvegarde des stats consolidées et envoi au résumé
      sessionStorage.setItem("stats", JSON.stringify(stats));
      sessionStorage.setItem("eleve1", JSON.stringify(eleve1));
      sessionStorage.setItem("eleve2", JSON.stringify(eleve2));
      sessionStorage.setItem("dureeCourse", String(dureeCourse));
      window.location.href = "resume.html";
    });
  });

  // ----- Fonctions -----
  function updateHeader() {
    if (titleEl) {
      titleEl.textContent = currentRunner === 0 ? "Course — Élève 1" : "Course — Élève 2";
    }
  }

  function resetRunnerDisplay() {
    updateHeader();
    timerEl.textContent = formatTime(totalSeconds);
    lapsEl.textContent = "0";
    distEl.textContent = "0";
    vitEl.textContent = "0.00";
    vmaEl.textContent = "0.00";
    lapBtn.disabled = false;
    nextBtn.style.display = currentRunner === 0 ? "none" : "none";
    summaryBtn.style.display = currentRunner === 1 ? "none" : "none";
  }

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
          // proposer fraction pour l’élève 1, puis bouton "Passer au coureur 2"
          nextBtn.style.display = "inline-block";
        } else {
          // proposer fraction pour l’élève 2, puis bouton "Aller au résumé"
          summaryBtn.style.display = "inline-block";
        }
      }
      timerEl.textContent = formatTime(totalSeconds);
      // pendant la course, la vitesse courante calculée sur le temps écoulé (optionnel)
      updateNumbers();
    }, 1000);
  }

  function updateNumbers() {
    lapsEl.textContent = String(laps);
    distEl.textContent = String(Math.round(distance));
    var elapsedMin = (Math.round(dureeCourse * 60) - totalSeconds) / 60;
    var vitesse = elapsedMin > 0 ? (distance / 1000) / elapsedMin : 0;
    vitEl.textContent = vitesse.toFixed(2);
    // VMA estimée simple : peut rester la VMA de l’élève s’il l’a, sinon estimation = vitesse
    var vmaEst = (currentRunner === 0 ? (eleve1.vma || vitesse) : (eleve2.vma || vitesse));
    vmaEl.textContent = (isFinite(vmaEst) ? vmaEst : 0).toFixed(2);
  }

  // Appelé quand un coureur a terminé (timer à 0 et clic sur Next/Summary)
  function finalizeCurrentRunner() {
    return new Promise(function (resolve) {
      // Fixe les valeurs finales de la course AVANT fraction
      var runnerIndex = currentRunner;
      var elapsedMin = dureeCourse; // le chrono était en compte à rebours
      var vitesse = (distance / 1000) / (elapsedMin > 0 ? elapsedMin : 1); // km/h
      var vmaEst = runnerIndex === 0 ? (eleve1.vma || vitesse) : (eleve2.vma || vitesse);

      // prépare un objet élève pour le passage à ajouterFraction()
      var eleveCalc = {
        nom: runnerIndex === 0 ? (eleve1.nom || "") : (eleve2.nom || ""),
        prenom: runnerIndex === 0 ? (eleve1.prenom || "") : (eleve2.prenom || ""),
        classe: runnerIndex === 0 ? (eleve1.classe || "") : (eleve2.classe || ""),
        sexe: runnerIndex === 0 ? (eleve1.sexe || "") : (eleve2.sexe || ""),
        distance: distance,      // m
        temps: dureeCourse,      // minutes
        vitesse: vitesse,        // km/h
        vma: vmaEst              // km/h (si fournie au départ, on la garde ; sinon on met la vitesse)
      };

      // Ouvre la UI de fraction (définie dans fraction.js)
      ajouterFraction(eleveCalc, longueurTour).then(function (eleveMaj) {
        
        // Recalcule vitesse & VMA après ajout de fraction
        eleveMaj.vitesse = kmhSmart(eleveMaj.distance, eleveMaj.temps);
        eleveMaj.vma = vmaEquiv6minSmart(eleveMaj.distance, eleveMaj.temps);

        // Si une VMA initiale était fournie pour cet élève, on la garde prioritairement
        var vmaSource = (runnerIndex === 0 ? eleve1.vma : eleve2.vma);
        if (isFinite(vmaSource) && vmaSource > 0) {
          eleveMaj.vma = vmaSource;
        }

        // Rafraîchit l'affichage après ajout de fraction
        try {
          distEl.textContent = String(Math.round(eleveMaj.distance));
          vitEl.textContent = (eleveMaj.vitesse).toFixed(2);
          vmaEl.textContent = (eleveMaj.vma).toFixed(2);
        } catch (e) {}

        // Stocke dans stats
        stats[runnerIndex] = {
          nom: eleveMaj.nom,
          prenom: eleveMaj.prenom,
          classe: eleveMaj.classe,
          sexe: eleveMaj.sexe,
          distance: Math.round(eleveMaj.distance * 100) / 100,
          vitesse: Math.round(eleveMaj.vitesse * 100) / 100,
          vma: Math.round(eleveMaj.vma * 100) / 100
        };

        // Sauvegarde intermédiaire des stats
    

        // Sauvegarde intermédiaire des stats (utile si on revient)
        sessionStorage.setItem("stats", JSON.stringify(stats));

        resolve();
      });
    });
  }

  // ----- Utils -----
  function byId(id) { return document.getElementById(id); }
  function safeParse(t) { try { return JSON.parse(t); } catch (e) { return null; } }
  function pickFirstNumber() {
    for (var i = 0; i < arguments.length; i++) {
      var v = parseFloat(arguments[i]);
      if (isFinite(v) && v > 0) return v;
    }
    return NaN;
  }
  function formatTime(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    }

})();
