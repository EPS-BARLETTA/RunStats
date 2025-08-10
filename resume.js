// resume.js

const stats = JSON.parse(sessionStorage.getItem("stats")) || [];
const tbody = document.querySelector("#recapTable tbody");
const btnAccueil = document.getElementById("btnAccueil");
const btnCSV = document.getElementById("btnCSV");
const btnProf = document.getElementById("btnProf");

// 🔹 Remplir tableau
function afficherTableau(editable = false) {
  tbody.innerHTML = "";
  stats.forEach((eleve, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${eleve.nom}</td>
      <td>${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td ${editable ? 'contenteditable="true"' : ""} data-index="${index}" data-field="distance">${eleve.distance}</td>
      <td>${eleve.vitesse.toFixed(2)}</td>
      <td>${eleve.vma.toFixed(2)}</td>
    `;

    tbody.appendChild(tr);
  });
}

// 🔹 Générer QR Code compatible ScanProf
function genererQRCode() {
  const data = stats.map(eleve => ({
    nom: eleve.nom,
    prenom: eleve.prenom,
    classe: eleve.classe,
    sexe: eleve.sexe,
    distance: eleve.distance,
    vitesse: parseFloat(eleve.vitesse.toFixed(2)),
    vma: parseFloat(eleve.vma.toFixed(2))
  }));

  new QRCode(document.getElementById("qrcode"), {
    text: JSON.stringify(data),
    width: 200,
    height: 200
  });
}

// 🔹 Exporter CSV
function exporterCSV() {
  const lignes = [
    ["Nom", "Prénom", "Classe", "Sexe", "Distance (m)", "Vitesse (km/h)", "VMA (km/h)"],
    ...stats.map(eleve => [
      eleve.nom,
      eleve.prenom,
      eleve.classe,
      eleve.sexe,
      eleve.distance,
      eleve.vitesse.toFixed(2),
      eleve.vma.toFixed(2)
    ])
  ];

  const csvContent = lignes.map(l => l.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 🔹 Activer mode Prof avec code PIN
function activerModeProf() {
  const code = prompt("Entrez le code PIN pour modifier les distances :");
  if (code === "57") {
    alert("Mode Prof activé ✅\nVous pouvez modifier les distances dans le tableau.");
    afficherTableau(true);

    tbody.addEventListener("input", e => {
      if (e.target.dataset.field === "distance") {
        const index = e.target.dataset.index;
        const nouvelleDistance = parseFloat(e.target.innerText) || 0;
        stats[index].distance = nouvelleDistance;
        stats[index].vitesse = (nouvelleDistance / 1000) / (stats[index].duree / 60 || 0.2); // recalcul vitesse
        stats[index].vma = stats[index].vitesse * 1.15;
      }
    });
  } else {
    alert("Code PIN incorrect ❌");
  }
}

// 🔹 Boutons
btnAccueil.addEventListener("click", () => {
  window.location.href = "index.html";
});
btnCSV.addEventListener("click", exporterCSV);
btnProf.addEventListener("click", activerModeProf);

// 🔹 Init
afficherTableau();
genererQRCode();
