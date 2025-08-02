// summary.js

// Récupérer les données des élèves depuis le localStorage
const eleve1 = JSON.parse(localStorage.getItem('eleve1Data'));
const eleve2 = JSON.parse(localStorage.getItem('eleve2Data'));

const summaryTable = document.getElementById('summaryTable');
const qrCanvas = document.getElementById('qrCodeCanvas');
const downloadCSVBtn = document.getElementById('downloadCSV');
const generateQRBtn = document.getElementById('generateQR');

// Fonction pour ajouter une ligne dans le tableau
function addRow(eleve) {
  if (!eleve) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${eleve.nom}</td>
    <td>${eleve.prenom}</td>
    <td>${eleve.classe}</td>
    <td>${eleve.sexe}</td>
    <td>${eleve.distance.toFixed(2)}</td>
    <td>${eleve.vitesseMoy.toFixed(2)}</td>
    <td>${eleve.vmaEstime.toFixed(2)}</td>
  `;
  summaryTable.appendChild(tr);
}

// Afficher les données dans le tableau
addRow(eleve1);
addRow(eleve2);

// Générer le CSV
function generateCSV() {
  const headers = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse Moy. (km/h)', 'VMA Estimée (km/h)'];
  const rows = [eleve1, eleve2].map(e => [
    e.nom, e.prenom, e.classe, e.sexe,
    e.distance.toFixed(2),
    e.vitesseMoy.toFixed(2),
    e.vmaEstime.toFixed(2)
  ]);
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

// Télécharger le CSV
downloadCSVBtn.addEventListener('click', () => {
  const csv = generateCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_bilan.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Générer le QR code avec les données formatées JSON
generateQRBtn.addEventListener('click', () => {
  if (!eleve1 || !eleve2) {
    alert('Données manquantes');
    return;
  }

  const qr = new QRious({
    element: qrCanvas,
    size: 250,
    value: JSON.stringify({ eleve1, eleve2 }),
    level: 'H',
  });
});
