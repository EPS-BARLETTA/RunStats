// Récupérer les données des deux élèves depuis localStorage
const eleve1 = JSON.parse(localStorage.getItem('eleve1Data'));
const eleve2 = JSON.parse(localStorage.getItem('eleve2Data'));

// Remplir les champs dans le DOM
if (eleve1) {
  document.getElementById('nom1').textContent = eleve1.nom || '';
  document.getElementById('prenom1').textContent = eleve1.prenom || '';
  document.getElementById('classe1').textContent = eleve1.classe || '';
  document.getElementById('sexe1').textContent = eleve1.sexe || '';
  document.getElementById('distance1').textContent = eleve1.distance.toFixed(2);
  document.getElementById('vitesse1').textContent = eleve1.vitesse.toFixed(2);
  document.getElementById('vma1').textContent = eleve1.vma ? eleve1.vma.toFixed(2) : 'N/A';
}

if (eleve2) {
  document.getElementById('nom2').textContent = eleve2.nom || '';
  document.getElementById('prenom2').textContent = eleve2.prenom || '';
  document.getElementById('classe2').textContent = eleve2.classe || '';
  document.getElementById('sexe2').textContent = eleve2.sexe || '';
  document.getElementById('distance2').textContent = eleve2.distance.toFixed(2);
  document.getElementById('vitesse2').textContent = eleve2.vitesse.toFixed(2);
  document.getElementById('vma2').textContent = eleve2.vma ? eleve2.vma.toFixed(2) : 'N/A';
}

// Fonction pour générer CSV
function generateCSV() {
  const headers = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse (km/h)', 'Estimation VMA (km/h)'];
  const rows = [
    [eleve1.nom, eleve1.prenom, eleve1.classe, eleve1.sexe, eleve1.distance.toFixed(2), eleve1.vitesse.toFixed(2), eleve1.vma ? eleve1.vma.toFixed(2) : 'N/A'],
    [eleve2.nom, eleve2.prenom, eleve2.classe, eleve2.sexe, eleve2.distance.toFixed(2), eleve2.vitesse.toFixed(2), eleve2.vma ? eleve2.vma.toFixed(2) : 'N/A']
  ];

  let csvContent = headers.join(';') + '\n';
  rows.forEach(row => {
    csvContent += row.join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'runstats_resultats.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fonction pour générer QR code
function generateQRCode() {
  const qrcodeContainer = document.getElementById('qrcode');
  qrcodeContainer.innerHTML = ''; // Clear previous QR if any

  const text = `
Élève 1: ${eleve1.prenom} ${eleve1.nom}, Classe: ${eleve1.classe}, Sexe: ${eleve1.sexe}, Distance: ${eleve1.distance.toFixed(2)}m, Vitesse: ${eleve1.vitesse.toFixed(2)}km/h, VMA: ${eleve1.vma ? eleve1.vma.toFixed(2) : 'N/A'}km/h
Élève 2: ${eleve2.prenom} ${eleve2.nom}, Classe: ${eleve2.classe}, Sexe: ${eleve2.sexe}, Distance: ${eleve2.distance.toFixed(2)}m, Vitesse: ${eleve2.vitesse.toFixed(2)}km/h, VMA: ${eleve2.vma ? eleve2.vma.toFixed(2) : 'N/A'}km/h
  `.trim();

  const qr = new QRious({
    element: qrcodeContainer,
    value: text,
    size: 250,
    backgroundAlpha: 0,
    foreground: '#333'
  });
}

// Événements sur les boutons
document.getElementById('downloadCSV').addEventListener('click', generateCSV);
document.getElementById('generateQR').addEventListener('click', generateQRCode);
