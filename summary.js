// Fonction pour récupérer les données stockées
function getData() {
  const eleve1 = JSON.parse(localStorage.getItem('eleve1')) || {};
  const eleve2 = JSON.parse(localStorage.getItem('eleve2')) || {};
  return { eleve1, eleve2 };
}

// Fonction pour créer le tableau résumé
function displayResults(eleve1, eleve2) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = `
    <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse; font-size: 1rem;">
      <thead style="background:#4CAF50; color:#fff;">
        <tr>
          <th>Élève</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Classe</th>
          <th>Sexe</th>
          <th>Distance (m)</th>
          <th>Vitesse moyenne (km/h)</th>
          <th>VMA estimée (km/h)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Élève 1</td>
          <td>${eleve1.nom || ''}</td>
          <td>${eleve1.prenom || ''}</td>
          <td>${eleve1.classe || ''}</td>
          <td>${eleve1.sexe || ''}</td>
          <td>${eleve1.distance ? eleve1.distance.toFixed(2) : ''}</td>
          <td>${eleve1.vitesse ? eleve1.vitesse.toFixed(2) : ''}</td>
          <td>${eleve1.vma ? eleve1.vma.toFixed(2) : ''}</td>
        </tr>
        <tr>
          <td>Élève 2</td>
          <td>${eleve2.nom || ''}</td>
          <td>${eleve2.prenom || ''}</td>
          <td>${eleve2.classe || ''}</td>
          <td>${eleve2.sexe || ''}</td>
          <td>${eleve2.distance ? eleve2.distance.toFixed(2) : ''}</td>
          <td>${eleve2.vitesse ? eleve2.vitesse.toFixed(2) : ''}</td>
          <td>${eleve2.vma ? eleve2.vma.toFixed(2) : ''}</td>
        </tr>
      </tbody>
    </table>
  `;
}

// Fonction pour générer un CSV à partir des données
function generateCSV(eleve1, eleve2) {
  const header = ['Élève', 'Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse moyenne (km/h)', 'VMA estimée (km/h)'];
  const rows = [
    ['Élève 1', eleve1.nom, eleve1.prenom, eleve1.classe, eleve1.sexe, eleve1.distance, eleve1.vitesse, eleve1.vma],
    ['Élève 2', eleve2.nom, eleve2.prenom, eleve2.classe, eleve2.sexe, eleve2.distance, eleve2.vitesse, eleve2.vma]
  ];

  let csvContent = header.join(';') + '\n';
  rows.forEach(row => {
    csvContent += row.map(item => (item !== undefined ? item : '')).join(';') + '\n';
  });

  return csvContent;
}

// Fonction pour télécharger un fichier (CSV)
function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_bilan.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fonction pour générer un QR code avec les infos des deux élèves (format JSON)
function generateQRCode(eleve1, eleve2) {
  // On va créer un JSON simplifié
  const data = {
    eleve1,
    eleve2
  };
  return JSON.stringify(data);
}

// Affichage du QR code avec la bibliothèque QRCode.js (à ajouter dans ton projet)
// https://davidshimjs.github.io/qrcodejs/
// Tu dois inclure ce script dans summary.html:
// <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>

// Fonction pour créer le QR code
function showQRCode(data) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = `<div id="qrcode" style="margin: 20px auto; width: 200px; height: 200px;"></div>`;
  new QRCode(document.getElementById('qrcode'), {
    text: data,
    width: 200,
    height: 200
  });
}

// Au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  const { eleve1, eleve2 } = getData();
  displayResults(eleve1, eleve2);

  document.getElementById('downloadCSVBtn').addEventListener('click', () => {
    const csv = generateCSV(eleve1, eleve2);
    downloadCSV(csv);
  });

  document.getElementById('downloadQRBtn').addEventListener('click', () => {
    const jsonData = generateQRCode(eleve1, eleve2);
    showQRCode(jsonData);
  });
});
