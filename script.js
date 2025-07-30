// Variables globales
let duree, longueurTour, nom, prenom, classe, vmaRef;
let secondesRestantes, timerInterval, nbTours = 0;
let etat = "";
let resultatQR = "";
let profPIN = localStorage.getItem("profPIN") || "0000";
let tableauResultats = [];

// ⏱️ Lancer la course
function demarrerCourse() {
  nom = document.getElementById("nom").value.trim();
  prenom = document.getElementById("prenom").value.trim();
  classe = document.getElementById("classe").value.trim();
  duree = parseFloat(document.getElementById("duree").value);
  longueurTour = parseFloat(document.getElementById("longueurTour").value);
  vmaRef = parseFloat(document.getElementById("vmaRef").value) || null;

  if (!nom || !prenom || !classe || !duree || !longueurTour) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  secondesRestantes = duree * 60;
  nbTours = 0;
  etat = "";
  updateChrono();

  document.getElementById("courseSection").style.display = "block";
  document.getElementById("resultats").style.display = "none";
  document.getElementById("infosCourse").innerText = "Tours : 0 — Distance : 0 m";

  timerInterval = setInterval(() => {
    secondesRestantes--;
    updateChrono();
    if (secondesRestantes <= 0) {
      clearInterval(timerInterval);
      finCourse();
    }
  }, 1000);
}

function updateChrono() {
  const chrono = document.getElementById("chrono");
  const minutes = Math.floor(secondesRestantes / 60);
  const secondes = secondesRestantes % 60;
  chrono.innerText = `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;
  chrono.style.color = secondesRestantes <= 10 ? "red" : "black";
}

function compterTour() {
  nbTours++;
  const distance = nbTours * longueurTour;
  document.getElementById("infosCourse").innerText = `Tours : ${nbTours} — Distance : ${distance} m`;
}

function resetCourse() {
  clearInterval(timerInterval);
  nbTours = 0;
  secondesRestantes = 0;
  document.getElementById("courseSection").style.display = "none";
  document.getElementById("resultats").style.display = "none";
}

function setEtat(e) {
  etat = e;
  document.getElementById("qrContainer").innerHTML = "QR généré ci-dessous.";
  genererQRCode();
}

// 🏁 Fin de la course
function finCourse() {
  document.getElementById("courseSection").style.display = "none";
  document.getElementById("resultats").style.display = "block";

  const distanceM = nbTours * longueurTour;
  const distanceKm = distanceM / 1000;
  const vitesse = (distanceKm / (duree / 60)).toFixed(2);
  const vmaReelle = (distanceM / duree).toFixed(2); // m/min

  let comparaison = "";
  if (vmaRef) {
    const ecart = (vmaReelle - vmaRef).toFixed(2);
    comparaison = `<br>VMA estimée : ${vmaReelle} m/min — Référence : ${vmaRef} m/min (${ecart > 0 ? "+" : ""}${ecart})`;
  }

  document.getElementById("resumeCourse").innerHTML = `
    <p><strong>${prenom} ${nom} — ${classe}</strong></p>
    <p>Durée : ${duree} min — Tours : ${nbTours}</p>
    <p>Distance : ${distanceM} m (${distanceKm.toFixed(2)} km)</p>
    <p>Vitesse moyenne : ${vitesse} km/h</p>
    ${comparaison}
  `;
}

// 📱 QR Code élève
function genererQRCode() {
  const distance = nbTours * longueurTour;
  const vmaReelle = (distance / duree).toFixed(2);
  const vitesse = ((distance / 1000) / (duree / 60)).toFixed(2);

  const data = {
    nom, prenom, classe, duree,
    distance, vitesse, vmaReelle, etat
  };
  const json = JSON.stringify(data);
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(json)}&size=200x200`;

  document.getElementById("qrContainer").innerHTML = `<img src="${qrURL}" alt="QR Code élève" />`;
}

// 🔐 Mode Prof : Vérification PIN
function checkProfPIN() {
  const saisie = document.getElementById("inputProfPIN").value;
  if (saisie === profPIN) {
    document.getElementById("profLogin").style.display = "none";
    document.getElementById("profDashboard").style.display = "block";
    renderProfTable();
  } else {
    alert("Code incorrect.");
  }
}

function changeProfPIN() {
  const nouveauPIN = document.getElementById("inputNewPIN").value;
  if (/^\d{4}$/.test(nouveauPIN)) {
    profPIN = nouveauPIN;
    localStorage.setItem("profPIN", nouveauPIN);
    alert("Code modifié !");
  } else {
    alert("Code PIN invalide (4 chiffres).");
  }
}

// 📷 Scan QR
function startQRScanner() {
  const scan = prompt("Collez ici le texte du QR code scanné (simulateur)");
  if (!scan) return;

  try {
    const data = JSON.parse(scan);
    tableauResultats.push(data);
    tableauResultats.sort((a, b) => a.nom.localeCompare(b.nom));
    renderProfTable();
  } catch (e) {
    alert("QR invalide");
  }
}

// 🧾 Affichage tableau prof
function renderProfTable() {
  const table = document.getElementById("profResultsTable");
  if (tableauResultats.length === 0) {
    table.innerHTML = "<tr><td>Aucun résultat scanné</td></tr>";
    return;
  }

  let html = `
    <tr>
      <th>Nom</th><th>Prénom</th><th>Classe</th>
      <th>Distance (m)</th><th>Durée (min)</th>
      <th>Vitesse (km/h)</th><th>VMA (m/min)</th><th>État</th>
    </tr>
  `;

  tableauResultats.forEach(r => {
    html += `
      <tr>
        <td>${r.nom}</td><td>${r.prenom}</td><td>${r.classe}</td>
        <td>${r.distance}</td><td>${r.duree}</td>
        <td>${r.vitesse}</td><td>${r.vmaReelle}</td><td>${r.etat}</td>
      </tr>
    `;
  });

  table.innerHTML = html;
}

// 💾 Export CSV
function exportCSV() {
  if (tableauResultats.length === 0) return alert("Aucune donnée à exporter.");

  const lignes = [
    ["Nom", "Prénom", "Classe", "Distance (m)", "Durée (min)", "Vitesse (km/h)", "VMA (m/min)", "État"]
  ];

  tableauResultats.forEach(r => {
    lignes.push([r.nom, r.prenom, r.classe, r.distance, r.duree, r.vitesse, r.vmaReelle, r.etat]);
  });

  const csvContent = lignes.map(l => l.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "RunStats_Prof_Results.csv";
  link.click();
}

// ♻️ Reset tableau
function resetProfData() {
  if (confirm("Effacer tous les résultats ?")) {
    tableauResultats = [];
    renderProfTable();
  }
}
