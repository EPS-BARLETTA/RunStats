// ------------------ Variables ------------------
let tempsTotal = 0; // en secondes
let chronoInterval;
let distanceTotale = 0;
let piste = 0;
let courseActuelle = 1; // 1 ou 2
let resultats = [];
let dureeMinutes = 0;

// ------------------ Initialisation ------------------
document.getElementById("startBtn").addEventListener("click", demarrerChrono);
document.getElementById("lapBtn").addEventListener("click", ajouterTour);
document.getElementById("resetBtn").addEventListener("click", resetCourse);

document.querySelectorAll(".etatBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    sauvegarderEtat(btn.dataset.forme);
  });
});

document.getElementById("accessProfBtn").addEventListener("click", () => {
  if (document.getElementById("profCode").value === "1234") {
    document.getElementById("profPanel").style.display = "block";
    lancerScannerQR();
  } else {
    alert("Code incorrect");
  }
});

// ------------------ Fonctions Chrono ------------------
function demarrerChrono() {
  // Récupère paramètres
  dureeMinutes = parseInt(document.getElementById("tempsCourse").value);
  piste = parseFloat(document.getElementById("distancePiste").value);

  if (!dureeMinutes || !piste) {
    alert("Entrez la durée et la distance de piste !");
    return;
  }

  tempsTotal = dureeMinutes * 60; // convertir en secondes
  distanceTotale = 0;
  afficherStats();

  document.getElementById("etatForme").style.display = "none";
  document.getElementById("chronoDisplay").textContent = formatTemps(tempsTotal);

  // Lancer compte à rebours
  chronoInterval = setInterval(() => {
    tempsTotal--;
    document.getElementById("chronoDisplay").textContent = formatTemps(tempsTotal);

    if (tempsTotal <= 0) {
      clearInterval(chronoInterval);
      finCourse();
    }
  }, 1000);
}

function ajouterTour() {
  if (!piste) {
    alert("Entrez la distance de la piste !");
    return;
  }
  distanceTotale += piste;
  afficherStats();
}

function resetCourse() {
  clearInterval(chronoInterval);
  tempsTotal = 0;
  distanceTotale = 0;
  document.getElementById("chronoDisplay").textContent = "00:00";
  document.getElementById("totalDistance").textContent = "0";
  document.getElementById("vitesseMoyenne").textContent = "0";
  document.getElementById("vmaEstimee").textContent = "0";
  document.getElementById("etatForme").style.display = "none";
  document.getElementById("qrCodeBox").innerHTML = "";
  courseActuelle = 1;
  resultats = [];
}

// ------------------ Fonctions Stats ------------------
function afficherStats() {
  // Calcul vitesse moyenne (km/h) = distance (m) / temps (s) * 3.6
  let tempsEcoule = dureeMinutes * 60 - tempsTotal;
  let vitesseMoy = tempsEcoule > 0 ? (distanceTotale / tempsEcoule) * 3.6 : 0;
  let vmaEstimee = vitesseMoy * 1.05; // estimation

  document.getElementById("totalDistance").textContent = distanceTotale.toFixed(0);
  document.getElementById("vitesseMoyenne").textContent = vitesseMoy.toFixed(1);
  document.getElementById("vmaEstimee").textContent = vmaEstimee.toFixed(1);
}

function finCourse() {
  document.getElementById("etatForme").style.display = "block";
}

// Sauvegarde l'état de forme + passe à l'élève suivant ou affiche QR
function sauvegarderEtat(emoji) {
  const nom = document.getElementById(`nom${courseActuelle}`).value;
  const prenom = document.getElementById(`prenom${courseActuelle}`).value;
  const sexe = document.getElementById(`sexe${courseActuelle}`).value;

  const vma = parseFloat(document.getElementById("vmaEstimee").textContent);
  resultats.push({
    nom,
    prenom,
    sexe,
    distance: distanceTotale,
    vma: vma,
    forme: emoji
  });

  if (courseActuelle === 1) {
    // Passer à l'élève 2
    courseActuelle = 2;
    resetCourse();
    alert("Course 1 terminée. Préparez l'élève 2 !");
  } else {
    // Générer QR après élève 2
    genererQRCode();
  }
}

// ------------------ QR Code ------------------
function genererQRCode() {
  const data = JSON.stringify(resultats);
  document.getElementById("qrCodeBox").innerHTML = "";
  new QRCode(document.getElementById("qrCodeBox"), {
    text: data,
    width: 256,
    height: 256
  });
}

// ------------------ Scanner QR (Espace Prof) ------------------
function lancerScannerQR() {
  const scanner = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      // Priorité à la caméra arrière
      const cam = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];
      scanner.start(
        cam.id,
        {
          fps: 10,
          qrbox: 250
        },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            remplirTableProf(data);
          } catch (e) {
            alert("QR invalide");
          }
        }
      );
    }
  }).catch(err => console.error(err));
}

// ------------------ Table Prof ------------------
function remplirTableProf(data) {
  const tbody = document.getElementById("profTableBody");
  tbody.innerHTML = "";
  data.forEach(el => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${el.nom}</td>
      <td>${el.prenom}</td>
      <td>${el.sexe}</td>
      <td>${el.distance}</td>
      <td>${el.vma}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------ Utilitaires ------------------
function formatTemps(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
