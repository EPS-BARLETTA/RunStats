// summary.js

// Fonction pour récupérer les données des coureurs depuis sessionStorage
function getRunnersData() {
  const eleve1 = JSON.parse(sessionStorage.getItem('eleve1'));
  const eleve2 = JSON.parse(sessionStorage.getItem('eleve2'));
  return [eleve1, eleve2];
}

// Fonction pour remplir le tableau bilan avec les données
function displayBilan() {
  const [eleve1, eleve2] = getRunnersData();
  const tbody = document.querySelector('#bilanTable tbody');
  tbody.innerHTML = '';

  [eleve1, eleve2].forEach((eleve) => {
    if (!eleve) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eleve.nom} ${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td>${eleve.distance.toFixed(3)}</td>
      <td>${eleve.vitesse.toFixed(2)}</td>
      <td>${eleve.vma.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Générer un CSV à partir des données
function generateCSV() {
  const [eleve1, eleve2] = getRunnersData();
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Nom Prénom,Classe,Sexe,Distance réalisée (km),Vitesse moyenne (km/h),VMA estimée (km/h)\r\n";

  [eleve1, eleve2].forEach(eleve => {
    if (!eleve) return;
    const row = [
      `${eleve.nom} ${eleve.prenom}`,
      eleve.classe,
      eleve.sexe,
      eleve.distance.toFixed(3),
      eleve.vitesse.toFixed(2),
      eleve.vma.toFixed(2),
    ];
    csvContent += row.join(",") + "\r\n";
  });

  return encodeURI(csvContent);
}

// Créer et déclencher le téléchargement du CSV
function downloadCSV() {
  const encodedUri = generateCSV();
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "runstats_bilan.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Générer un QR code avec le résumé des deux coureurs (format JSON string)
function downloadQR() {
  const [eleve1, eleve2] = getRunnersData();
  if (!eleve1 || !eleve2) {
    alert("Données manquantes pour générer le QR code.");
    return;
  }

  const data = {
    eleve1,
    eleve2
  };

  const jsonData = JSON.stringify(data);

  // Créer un canvas temporaire pour générer le QR
  const canvas = document.createElement("canvas");

  QRCode.toCanvas(canvas, jsonData, { width: 300 }, function (error) {
    if (error) {
      alert("Erreur lors de la génération du QR code.");
      console.error(error);
      return;
    }

    // Convertir le canvas en image téléchargeable
    const imgData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imgData;
    link.download = "runstats_bilan_qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Event listeners
document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
document.getElementById("downloadQR").addEventListener("click", downloadQR);

// Au chargement de la page, afficher le bilan
window.onload = displayBilan;
