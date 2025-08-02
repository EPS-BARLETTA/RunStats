// summary.js

// Récupérer les données des deux élèves dans le localStorage
const eleve1 = JSON.parse(localStorage.getItem('eleve1Data'));
const eleve2 = JSON.parse(localStorage.getItem('eleve2Data'));

const tableBody = document.getElementById('resultsBody');
const downloadCsvBtn = document.getElementById('downloadCsv');
const downloadQrBtn = document.getElementById('downloadQr');

// Fonction pour créer une ligne tableau pour un élève
function createRow(eleve) {
  if (!eleve) return '';

  return `
    <tr>
      <td>${eleve.nom}</td>
      <td>${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td>${eleve.distance.toFixed(2)} m</td>
      <td>${eleve.vitesse.toFixed(2)} m/s</td>
      <td>${eleve.vma ? eleve.vma.toFixed(2) : 'N/A'} km/h</td>
    </tr>
  `;
}

// Insérer les lignes dans le tableau
tableBody.innerHTML = createRow(eleve1) + createRow(eleve2);

// Fonction pour générer CSV
function generateCSV() {
  const headers = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse (m/s)', 'VMA (km/h)'];
  const rows = [eleve1, eleve2].map(e => [
    e.nom,
    e.prenom,
    e.classe,
    e.sexe,
    e.distance.toFixed(2),
    e.vitesse.toFixed(2),
    e.vma ? e.vma.toFixed(2) : 'N/A'
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(r => {
    csvContent += r.join(',') + '\n';
  });

  return csvContent;
}

// Télécharger CSV
downloadCsvBtn.addEventListener('click', () => {
  const csv = generateCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_Bilan.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Générer QR Code (utilisation de QRCode.js ou une librairie similaire requise)
downloadQrBtn.addEventListener('click', () => {
  const qrData = {
    eleve1,
    eleve2
  };
  const qrString = JSON.stringify(qrData);

  // Utilisation de QRCode library (assure-toi d'avoir ajouté la librairie dans summary.html)
  const qrContainer = document.getElementById('qrCodeContainer');
  qrContainer.innerHTML = ''; // Reset

  new QRCode(qrContainer, {
    text: qrString,
    width: 200,
    height: 200
  });
});
