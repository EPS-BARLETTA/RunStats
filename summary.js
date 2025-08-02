// Récupération des données stockées dans le localStorage
const eleve1Data = JSON.parse(localStorage.getItem('eleve1Data'));
const eleve2Data = JSON.parse(localStorage.getItem('eleve2Data'));

const downloadCSVBtn = document.getElementById('downloadCSV');
const downloadQRBtn = document.getElementById('downloadQR');
const qrCodeContainer = document.getElementById('qrCodeContainer');

// Fonction pour générer le CSV à partir des données des deux élèves
function generateCSV() {
  const headers = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse moyenne (km/h)', 'VMA estimée (km/h)'];
  const rows = [eleve1Data, eleve2Data].map(eleve => [
    eleve.nom,
    eleve.prenom,
    eleve.classe,
    eleve.sexe,
    eleve.distance.toFixed(2),
    eleve.vitesseMoyenne.toFixed(2),
    eleve.vma.toFixed(2),
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

// Fonction pour déclencher le téléchargement du CSV
function downloadCSV() {
  const csv = generateCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_bilan.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fonction pour générer un QR code (utilise la librairie QRCode.js)
function generateQRCode(data) {
  qrCodeContainer.innerHTML = ''; // Nettoyer la zone

  // On crée un objet QRCode (il faut inclure qrcode.min.js dans ton projet)
  new QRCode(qrCodeContainer, {
    text: data,
    width: 180,
    height: 180,
  });
}

// Fonction pour générer les données text à encoder en QR code
function generateQRData() {
  const eleves = [eleve1Data, eleve2Data];
  return eleves.map(eleve =>
    `Nom: ${eleve.nom}, Prénom: ${eleve.prenom}, Classe: ${eleve.classe}, Sexe: ${eleve.sexe}, Distance: ${eleve.distance.toFixed(2)} m, Vitesse Moyenne: ${eleve.vitesseMoyenne.toFixed(2)} km/h, VMA estimée: ${eleve.vma.toFixed(2)} km/h`
  ).join('\n\n');
}

// Événements
downloadCSVBtn.addEventListener('click', () => {
  downloadCSV();
});

downloadQRBtn.addEventListener('click', () => {
  const data = generateQRData();
  generateQRCode(data);
});
