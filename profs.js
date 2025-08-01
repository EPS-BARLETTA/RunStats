// profs.js
// Gestion du scan QR Code et affichage des résultats

const scanBtn = document.getElementById("scanBtn");
const resultatsTable = document.getElementById("resultatsTable");
let scanner;

scanBtn.addEventListener("click", () => {
  if (!scanner) {
    scanner = new Instascan.Scanner({ video: document.getElementById("preview") });
    scanner.addListener("scan", function (content) {
      try {
        const data = JSON.parse(content);
        ajouterResultat(data);
      } catch (e) {
        alert("QR Code invalide !");
      }
    });

    Instascan.Camera.getCameras().then(function (cameras) {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      } else {
        alert("Aucune caméra détectée !");
      }
    }).catch(function (e) {
      console.error(e);
      alert("Erreur lors de l'accès à la caméra");
    });
  }
});

// Ajoute une ligne au tableau avec les données scannées
function ajouterResultat(data) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${data.eleve1.nom}</td>
    <td>${data.eleve1.prenom}</td>
    <td>${data.eleve1.classe}</td>
    <td>${data.eleve1.sexe}</td>
    <td>${data.eleve2.nom}</td>
    <td>${data.eleve2.prenom}</td>
    <td>${data.eleve2.classe}</td>
    <td>${data.eleve2.sexe}</td>
    <td>${data.stats.tours}</td>
    <td>${data.stats.distanceTotale}</td>
    <td>${data.stats.vma}</td>
  `;

  resultatsTable.appendChild(tr);
}
