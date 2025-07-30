let chronoInterval, totalSecondes, secondesRestantes;
let nbTours = 0, etatForme = "";
let resultatsEleves = [];
let currentPIN = "0000";
let scanner;

function demarrerCourse() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const classe = document.getElementById("classe").value.trim();
  const duree = parseInt(document.getElementById("duree").value);
  const longueurTour = parseFloat(document.getElementById("longueurTour").value);

  if (!nom || !prenom || !classe || !duree || !longueurTour) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  nbTours = 0;
  totalSecondes = duree * 60;
  secondesRestantes = totalSecondes;
  etatForme = "";
  document.getElementById("courseSection").style.display = "block";
  document.getElementById("resultats").style.display = "none";
  updateChrono();
  updateInfosCourse();

  chronoInterval = setInterval(() => {
    secondesRestantes--;
    updateChrono();
    if (secondesRestantes <= 0) {
      clearInterval(chronoInterval);
      afficherResultats();
    }
  }, 1000);
}

function updateChrono() {
  const minutes = Math.floor(secondesRestantes / 60);
  const secondes = secondesRestantes % 60;
  const chrono = document.getElementById("chrono");
  chrono.innerText = `${minutes.toString().padStart(2, "0")}:${secondes.toString().padStart(2, "0")}`;
  chrono.style.color = secondesRestantes <= 10 ? "red" : "black";
}

function compterTour() {
  nbTours++;
  updateInfosCourse();
}

function updateInfosCourse() {
  const longueurTour = parseFloat(document.getElementById("longueurTour").value);
  const distanceTotale = nbTours * longueurTour;
  document.getElementById("infosCourse").innerText =
    `Tours : ${nbTours} — Distance : ${distanceTotale} m (${(distanceTotale / 1000).toFixed(2)} km)`;
}

function resetCourse() {
  clearInterval(chronoInterval);
  nbTours = 0;
  secondesRestantes = 0;
  document.getElementById("courseSection").style.display = "none";
  document.getElementById("resultats").style.display = "none";
  document.getElementById("infosCourse").innerText = "";
  document.getElementById("resumeCourse").innerText = "";
  document.getElementById("qrContainer").innerHTML = "";
}

function afficherResultats() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const classe = document.getElementById("classe").value.trim();
  const longueurTour = parseFloat(document.getElementById("longueurTour").value);
  const duree = parseInt(document.getElementById("duree").value);
  const vmaRef = parseFloat(document.getElementById("vmaRef").value);

  const distanceTotale = nbTours * longueurTour;
  const vitesseMoyenne = (distanceTotale / 1000) / (duree / 60); // en km/h
  const vmaEstimee = vitesseMoyenne / 0.9;

  document.getElementById("courseSection").style.display = "none";
  document.getElementById("resultats").style.display = "block";
  document.getElementById("resumeCourse").innerHTML = `
    Nom : ${nom} ${prenom} (${classe})<br>
    Temps : ${duree} min — Distance : ${distanceTotale} m<br>
    Vitesse moyenne : ${vitesseMoyenne.toFixed(2)} km/h<br>
    VMA estimée : ${vmaEstimee.toFixed(2)} km/h ${vmaRef ? `(Réf : ${vmaRef} km/h)` : ""}
  `;
}

function setEtat(emoji) {
  etatForme = emoji;
  document.getElementById("resumeCourse").innerHTML += `<br>État ressenti : ${emoji}`;
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const classe = document.getElementById("classe").value.trim();
  const duree = parseInt(document.getElementById("duree").value);
  const longueurTour = parseFloat(document.getElementById("longueurTour").value);
  const distanceTotale = nbTours * longueurTour;
  const vitesse = (distanceTotale / 1000) / (duree / 60);
  const vmaEstimee = vitesse / 0.9;

  const data = {
    nom, prenom, classe, duree, tours: nbTours, distance: distanceTotale,
    vitesse: vitesse.toFixed(2), vma: vmaEstimee.toFixed(2), etat: emoji
  };

  generateQRCode(data);
}

function generateQRCode(data) {
  const json = JSON.stringify(data);
  const container = document.getElementById("qrContainer");
  container.innerHTML = "";
  const qr = document.createElement("img");
  qr.src = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(json) + "&size=200x200";
  container.appendChild(qr);
}

function checkProfPIN() {
  const pin = document.getElementById("inputProfPIN").value;
  if (pin === currentPIN) {
    document.getElementById("profDashboard").style.display = "block";
    document.getElementById("profLogin").style.display = "none";
  } else {
    alert("Code incorrect.");
  }
}

function changeProfPIN() {
  const newPIN = document.getElementById("inputNewPIN").value;
  if (newPIN.length === 4 && /^\d+$/.test(newPIN)) {
    currentPIN = newPIN;
    alert("Code PIN mis à jour.");
    document.getElementById("inputNewPIN").value = "";
  } else {
    alert("Code invalide.");
  }
}

function startQRScanner() {
  if (!scanner) {
    scanner = new Html5Qrcode("qr-reader");
  }
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        addResult(data);
        scanner.stop();
        document.getElementById("qr-reader").innerHTML = "";
      } catch (e) {
        alert("QR code invalide");
      }
    },
    (err) => {
      console.warn(err);
    }
  );
}

function stopQRScanner() {
  if (scanner) {
    scanner.stop().then(() => {
      document.getElementById("qr-reader").innerHTML = "";
    });
  }
}

function addResult(data) {
  resultatsEleves.push(data);
  afficherTableau();
}

function afficherTableau() {
  resultatsEleves.sort((a, b) => a.nom.localeCompare(b.nom));
  const table = document.getElementById("profResultsTable");
  table.innerHTML = "<tr><th>Nom</th><th>Classe</th><th>Distance</th><th>Vitesse</th><th>VMA</th><th>État</th></tr>";
  resultatsEleves.forEach(e => {
    table.innerHTML += `<tr>
      <td>${e.nom} ${e.prenom}</td>
      <td>${e.classe}</td>
      <td>${e.distance} m</td>
      <td>${e.vitesse} km/h</td>
      <td>${e.vma} km/h</td>
      <td>${e.etat}</td>
    </tr>`;
  });
}

function exportCSV() {
  let csv = "Nom,Prénom,Classe,Distance (m),Vitesse (km/h),VMA,État\n";
  resultatsEleves.forEach(e => {
    csv += `${e.nom},${e.prenom},${e.classe},${e.distance},${e.vitesse},${e.vma},${e.etat}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "RunStats_Prof_Results.csv";
  a.click();
}

function resetProfData() {
  resultatsEleves = [];
  afficherTableau();
}
