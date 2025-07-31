// === Variables globales ===
let laps = 0;
let countdownTime = 0;
let countdownTimer = null;
let chronoRunning = false;

const nom1Input = document.getElementById("nom1");
const prenom1Input = document.getElementById("prenom1");
const sexe1Select = document.getElementById("sexe1");

const nom2Input = document.getElementById("nom2");
const prenom2Input = document.getElementById("prenom2");
const sexe2Select = document.getElementById("sexe2");

const dureeInput = document.getElementById("duree");
const distanceTourInput = document.getElementById("distanceTour");
const vmaRefInput = document.getElementById("vmaRef");

const chronoDisplay = document.getElementById("chronoDisplay");
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");

const distanceTotalDiv = document.getElementById("distanceTotal");
const vitesseMoyDiv = document.getElementById("vitesseMoy");
const vmaRealDiv = document.getElementById("vmaReal");

const etatFormeDiv = document.getElementById("etatForme");
const etatButtons = document.querySelectorAll(".etatBtn");

const qrCodeBox = document.getElementById("qrCodeBox");

const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const logoutBtn = document.getElementById("logoutBtn");
const profDashboard = document.getElementById("profDashboard");
const qrReaderDiv = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const resultsBody = document.getElementById("resultsBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const PROF_PIN = "eps1234";  // Code prof simple pour la demo

let currentTimeSeconds = 0;
let maxTimeSeconds = 0;
let results = [];
let courseNum = 1;
let chronoInterval = null;

let html5QrcodeScanner = null;

// === Fonctions chrono ===
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function updateChrono() {
  if(currentTimeSeconds > 0){
    currentTimeSeconds--;
    chronoDisplay.textContent = formatTime(currentTimeSeconds);
    if(currentTimeSeconds === 0){
      stopChrono();
      onCourseEnd();
    }
  }
}

function startChrono() {
  if(chronoRunning) return;
  const dureeVal = Number(dureeInput.value);
  if(!dureeVal || dureeVal <= 0){
    alert("Veuillez saisir une durée valide (en minutes).");
    return;
  }
  maxTimeSeconds = dureeVal * 60;
  currentTimeSeconds = maxTimeSeconds;
  chronoDisplay.textContent = formatTime(currentTimeSeconds);
  chronoInterval = setInterval(updateChrono, 1000);
  chronoRunning = true;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function stopChrono() {
  clearInterval(chronoInterval);
  chronoRunning = false;
  startBtn.disabled = true;
  lapBtn.disabled = true;
  resetBtn.disabled = false;
}

function resetChrono() {
  clearInterval(chronoInterval);
  chronoRunning = false;
  currentTimeSeconds = 0;
  chronoDisplay.textContent = "00:00";
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;

  // Reset tout
  laps = 0;
  distanceTotalDiv.textContent = 0;
  vitesseMoyDiv.textContent = "0.00";
  vmaRealDiv.textContent = "0.00";
  etatFormeDiv.style.display = "none";
  qrCodeBox.innerHTML = "";
}

// === Boutons gestion ===

startBtn.addEventListener("click", () => {
  if(!nom1Input.value || !prenom1Input.value || !nom2Input.value || !prenom2Input.value){
    alert("Veuillez remplir nom et prénom des deux élèves.");
    return;
  }
  if(!distanceTourInput.value || distanceTourInput.value <= 0){
    alert("Veuillez saisir une distance de tour valide (en mètres).");
    return;
  }
  startChrono();
});

lapBtn.addEventListener("click", () => {
  laps++;
  updateStats();
});

resetBtn.addEventListener("click", () => {
  resetChrono();
  results = [];
  courseNum = 1;
});

// === Calculs ===
function updateStats() {
  const distanceTour = Number(distanceTourInput.value);
  const dureeMinutes = Number(dureeInput.value);

  const totalDistance = laps * distanceTour;
  distanceTotalDiv.textContent = totalDistance;

  const dureeHeures = dureeMinutes / 60;
  const vitesseMoyenne = totalDistance / 1000 / dureeHeures;
  vitesseMoyDiv.textContent = vitesseMoyenne.toFixed(2);

  // VMA estimée = vitesse moyenne * facteur (ex: 1.07)
  let vmaRef = Number(vmaRefInput.value);
  if(!vmaRef || vmaRef <= 0) vmaRef = vitesseMoyenne * 1.07;
  vmaRealDiv.textContent = vmaRef.toFixed(2);
}

// === Fin de course ===
function onCourseEnd() {
  stopChrono();

  // Afficher état forme pour élève courant
  etatFormeDiv.style.display = "block";

  etatButtons.forEach(btn => {
    btn.disabled = false;
  });
}

// Gestion des états de forme
etatButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const etat = btn.getAttribute("data-etat");

    // Récupérer infos élève selon courseNum
    let eleve = {};
    if(courseNum === 1){
      eleve.nom = nom1Input.value.trim();
      eleve.prenom = prenom1Input.value.trim();
      eleve.sexe = sexe1Select.value;
    } else {
      eleve.nom = nom2Input.value.trim();
      eleve.prenom = prenom2Input.value.trim();
      eleve.sexe = sexe2Select.value;
    }

    // Sauvegarde résultats pour cet élève
    const duree = Number(dureeInput.value);
    const distance = laps * Number(distanceTourInput.value);
    const vitesseMoy = Number(vitesseMoyDiv.textContent);
    const vma = Number(vmaRealDiv.textContent);

    results[courseNum - 1] = {
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      duree,
      distance,
      vitesseMoy,
      vma,
      etat,
    };

    // Réinitialiser UI pour prochaine course ou afficher QR code
    etatFormeDiv.style.display = "none";
    laps = 0;
    distanceTotalDiv.textContent = 0;
    vitesseMoyDiv.textContent = "0.00";
    vmaRealDiv.textContent = "0.00";
    resetChrono();

    if(courseNum === 1) {
      // Passe à la course 2
      courseNum = 2;
      alert("Course 1 terminée. Maintenant, course 2.");
    } else {
      // Fin des deux courses : afficher QR code
      afficherQRCode();
      alert("Les deux courses sont terminées. Voici le QR code des résultats.");
    }
  });
});

// === Affichage QR Code ===
function afficherQRCode() {
  qrCodeBox.innerHTML = '';

  const data = JSON.stringify(results, null, 2);

  new QRCode(qrCodeBox, {
    text: data,
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}

// === Partie Professeur ===

profPinSubmit.addEventListener("click", () => {
  const pin = profPinInput.value.trim();
  if(pin === PROF_PIN){
    profPinInput.style.display = "none";
    profPinSubmit.style.display = "none";
    logoutBtn.style.display = "inline-block";
    profDashboard.style.display = "block";
    startScanner();
  } else {
    alert("Code prof incorrect");
  }
});

logoutBtn.addEventListener("click", () => {
  stopScanner();
  profPinInput.style.display = "inline-block";
  profPinSubmit.style.display = "inline-block";
  logoutBtn.style.display = "none";
  profDashboard.style.display = "none";
  resultsBody.innerHTML = "";
  qrReaderDiv.innerHTML = "";
  profPinInput.value = "";
});

stopScanBtn.addEventListener("click", () => {
  stopScanner();
});

// Scanner QR code
function startScanner() {
  if(html5QrcodeScanner) return; // Déjà lancé

  html5QrcodeScanner = new Html5Qrcode("qr-reader");

  html5QrcodeScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    qrCodeMessage => {
      // Le QR code a été scanné avec succès
      try {
        const data = JSON.parse(qrCodeMessage);
        afficherResultatsProf(data);
        alert("QR Code scanné avec succès !");
        stopScanner();
      } catch(e) {
        alert("QR Code invalide ou mauvaise structure JSON.");
      }
    },
    errorMessage => {
      // console.log("QR code scan error: " + errorMessage);
    }
  ).catch(err => {
    alert("Erreur d'initialisation du scanner : " + err);
  });
}

function stopScanner() {
  if(html5QrcodeScanner){
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }).catch(err => {
      console.error("Erreur arrêt scanner", err);
    });
  }
}

// Affiche résultats dans tableau prof
function afficherResultatsProf(data) {
  resultsBody.innerHTML = "";
  data.forEach((elv, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${elv.nom}</td>
      <td>${elv.prenom}</td>
      <td>${elv.sexe}</td>
      <td>${elv.duree} min</td>
      <td>${elv.distance} m</td>
      <td>${elv.vitesseMoy.toFixed(2)} km/h</td>
      <td>${elv.vma.toFixed(2)} km/h</td>
      <td>${elv.etat}</td>
    `;
    resultsBody.appendChild(tr);
  });
}

// Export CSV
exportCsvBtn.addEventListener("click", () => {
  if(resultsBody.children.length === 0){
    alert("Aucun résultat à exporter.");
    return;
  }
  const rows = [["#", "Nom", "Prénom", "Sexe", "Durée (min)", "Distance (m)", "Vitesse (km/h)", "VMA (km/h)", "État"]];
  Array.from(resultsBody.children).forEach(tr => {
    const cols = Array.from(tr.children).map(td => td.textContent);
    rows.push(cols);
  });
  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "RunStats_results.csv";
  link.click();
});
