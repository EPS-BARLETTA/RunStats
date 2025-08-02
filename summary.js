// Récupérer les données des deux élèves depuis localStorage
const eleve1 = JSON.parse(localStorage.getItem('eleve1'));
const eleve2 = JSON.parse(localStorage.getItem('eleve2'));

const resultsTableBody = document.querySelector('#resultsTable tbody');
const qrcodeContainer = document.getElementById('qrcode');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');

// Fonction pour ajouter une ligne au tableau
function addRow(eleve) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${eleve.nom}</td>
    <td>${eleve.prenom}</td>
    <td>${eleve.classe}</td>
    <td>${eleve.sexe}</td>
    <td>${eleve.distance.toFixed(2)}</td>
    <td>${eleve.vitesse.toFixed(2)}</td>
    <td>${eleve.vma.toFixed(2)}</td>
  `;
  resultsTableBody.appendChild(tr);
}

// Remplir le tableau avec les données
if (eleve1) addRow(eleve1);
if (eleve2) addRow(eleve2);

// Fonction pour générer CSV
function generateCSV(data) {
  const headers = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance réalisée (m)', 'Vitesse moyenne (km/h)', 'VMA estimée (km/h)'];
  const rows = data.map(e => [
    e.nom, e.prenom, e.classe, e.sexe,
    e.distance.toFixed(2),
    e.vitesse.toFixed(2),
    e.vma.toFixed(2)
  ]);
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });
  return csvContent;
}

// Télécharger le CSV
downloadCsvBtn.addEventListener('click', () => {
  const data = [eleve1, eleve2].filter(Boolean);
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_results.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Générer et afficher QR code
downloadQrBtn.addEventListener('click', () => {
  qrcodeContainer.innerHTML = ''; // Reset QR code container
  const data = [eleve1, eleve2].filter(Boolean);
  const summaryText = data.map(e => 
    `${e.prenom} ${e.nom} - Classe: ${e.classe} - Sexe: ${e.sexe} - Distance: ${e.distance.toFixed(2)}m - Vitesse: ${e.vitesse.toFixed(2)} km/h - VMA: ${e.vma.toFixed(2)} km/h`
  ).join('\n');

  new QRCode(qrcodeContainer, {
    text: summaryText,
    width: 200,
    height: 200
  });
});
