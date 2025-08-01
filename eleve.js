// Variables globales
let currentRunner = 1; // 1 ou 2
let running = false;
let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;
let totalDuration = 0; // en secondes
let toursCount = 0;

let results = {
  1: { nom: "", prenom: "", classe: "", sexe: "", tours: 0, distance: 0, vmaEstimee: 0 },
  2: { nom: "", prenom: "", classe: "", sexe: "", tours: 0, distance: 0, vmaEstimee: 0 }
};

// DOM
const btnDemarrer = document.getElementById("btnDemarrer");
const btnTour = document.getElementById("btnTour");
const btnReset = document.getElementById("btnReset");
const timerDisplay = document.getElementById("timer");
const infosCourse = document.getElementById("infosCourse");
const qrCodeDiv = document.getElementById("qrCode");

// Inputs élèves
const inputs = {
  nom1: document.getElementById("nom1"),
  prenom1: document.getElementById("prenom1"),
  classe1: document.getElementById("classe1"),
  sexe1: document.getElementById("sexe1"),
  nom2: document.getElementById("nom2"),
  prenom2: document.getElementById("prenom2"),
  classe2: document.getElementById("classe2"),
  sexe2: document.getElementById("sexe2"),
  dureeCourse: document.getElementById("dureeCourse"),
  distanceTour: document.getElementById("distanceTour"),
  vmaConnu: document.getElementById("vmaConnu")
};

function validerSaisie() {
  // Vérifie que les champs essentiels sont remplis et valides
  if (
    !inputs.nom1.value.trim() || !inputs.prenom1.value.trim() || !inputs.classe1.value.trim() ||
    !inputs.nom2.value.trim() || !inputs.prenom2.value.trim() || !inputs.classe2.value.trim()
  ) {
    alert("Merci de remplir tous les champs nom, prénom, classe pour les deux élèves.");
    return false;
  }
  if (isNaN(parseFloat(inputs.dureeCourse.value)) || parseFloat(inputs.dureeCourse.value) <= 0) {
    alert("Merci de saisir une durée de course valide (>0).");
    return false;
  }
  if (isNaN(parseFloat(inputs.distanceTour.value)) || parseFloat(inputs.distanceTour.value) <= 0) {
    alert("Merci de saisir une distance de tour valide (>0).");
    return false;
  }
  return true;
}

function afficherTemps(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

function demarrerChrono() {
  if (!validerSaisie()) return;

  if (running) return;

  totalDuration = Math.floor(parseFloat(inputs.dureeCourse.value) * 60);
  toursCount = 0;
  elapsedSeconds = 0;
  running = true;
  startTime = Date.now();

  // Enregistrer infos coureur courant
  const i = currentRunner;
  results[i].nom = inputs["nom"+i].value.trim();
  results[i].prenom = inputs["prenom"+i].value.trim();
  results[i].classe = inputs["classe"+i].value.trim();
  results[i].sexe = inputs["sexe"+i].value;

  // Cacher saisie pendant la course
  cacherSaisie(true);

  btnDemarrer.disabled = true;
  btnTour.disabled = false;
  btnReset.disabled = false;

  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    if (elapsedSeconds >= totalDuration) {
      stopChrono();
      return;
    }

    timerDisplay.textContent = `Course ${i} - Temps: ${afficherTemps(elapsedSeconds)} / ${afficherTemps(totalDuration)}`;
  }, 500);
}

function stopChrono() {
  clearInterval(timerInterval);
  running = false;
  btnTour.disabled = true;
  btnDemarrer.disabled = false;

  timerDisplay.textContent = `Course ${currentRunner} terminée - Temps : ${afficherTemps(elapsedSeconds)}`;

  // Calcul distance et VMA estimée
  const distTour = parseFloat(inputs.distanceTour.value);
  results[currentRunner].tours = toursCount;
  results[currentRunner].distance = toursCount * distTour;
  // VMA estimée = distance parcourue (en m) / durée (en s) * 3.6 (km/h)
  results[currentRunner].vmaEstimee = ((results[currentRunner].distance / elapsedSeconds) * 3.6).toFixed(2);

  afficherInfosCourse();

  if (currentRunner === 1) {
    currentRunner = 2;
    alert(`Course 1 terminée.\nPassez à l'élève 2 : ${results[2].prenom} ${results[2].nom}\nPuis cliquez sur Démarrer.`);
    // Montrer à nouveau la saisie pour élève 2
    cacherSaisie(false);
    resetChronoAffichage();
  } else {
    // Fin des deux courses -> afficher QR code
    genererQRCode();
  }
}

function cacherSaisie(cacher) {
  const opacity = cacher ? "0.3" : "1";
  // Désactiver ou activer les champs
  Object.values(inputs).forEach(input => {
    input.disabled = cacher;
    input.style.opacity = opacity;
  });
}

function resetChronoAffichage() {
  timerDisplay.textContent = "";
  infosCourse.innerHTML = "";
  qrCodeDiv.innerHTML = "";
  toursCount = 0;
}

function ajouterTour() {
  if (!running) return;
  toursCount++;
  afficherInfosCourse();
}

function afficherInfosCourse() {
  const r = results[currentRunner];
  infosCourse.innerHTML = `
    <p><strong>Élève :</strong> ${r.prenom} ${r.nom} (${r.classe})</p>
    <p><strong>Tours :</strong> ${toursCount}</p>
    <p><strong>Distance parcourue :</strong> ${(toursCount * parseFloat(inputs.distanceTour.value)).toFixed(1)} m</p>
    <p><strong>VMA estimée :</strong> ${r.vmaEstimee ? r.vmaEstimee + " km/h" : "---"}</p>
  `;
}

function resetTout() {
  if (running) {
    clearInterval(timerInterval);
    running = false;
  }
  currentRunner = 1;
  toursCount = 0;
  elapsedSeconds = 0;
  results = {
    1: { nom: "", prenom: "", classe: "", sexe: "", tours: 0, distance: 0, vmaEstimee: 0 },
    2: { nom: "", prenom: "", classe: "", sexe: "", tours: 0, distance: 0, vmaEstimee: 0 }
  };
  cacherSaisie(false);
  resetChronoAffichage();
  btnDemarrer.disabled = false;
  btnTour.disabled = true;
  btnReset.disabled = false;
  qrCodeDiv.innerHTML = "";
}

function genererQRCode() {
  // Données à encoder dans le QR code
  const data = {
    eleve1: results[1],
    eleve2: results[2]
  };

  qrCodeDiv.innerHTML = "<h3>QR Code des résultats</h3>";
  QRCode.toCanvas(qrCodeDiv, JSON.stringify(data), { width: 220 }, function (error) {
    if (error) console.error(error);
  });
}

// Événements boutons
btnDemarrer.addEventListener("click", demarrerChrono);
btnTour.addEventListener("click", ajouterTour);
btnReset.addEventListener("click", resetTout);

// Au démarrage
btnTour.disabled = true;
btnReset.disabled = false;
timerDisplay.textContent = "";
infosCourse.innerHTML = "";
qrCodeDiv.innerHTML = "";
