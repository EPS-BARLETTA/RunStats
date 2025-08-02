// Récupérer les données stockées (localStorage ou sessionStorage)
const eleve1 = JSON.parse(localStorage.getItem('eleve1'));
const eleve2 = JSON.parse(localStorage.getItem('eleve2'));

const tbody = document.querySelector('#resultsTable tbody');

function kmh(distanceMeters, durationSeconds) {
  if (durationSeconds === 0) return 0;
  return ((distanceMeters / 1000) / (durationSeconds / 3600)).toFixed(2);
}

function remplirTable() {
  if (!eleve1 || !eleve2) {
    tbody.innerHTML = '<tr><td colspan="7">Pas de données disponibles.</td></tr>';
    return;
  }

  const rows = [eleve1, eleve2].map(eleve => {
    const vitesse = kmh(eleve.distanceTotale, eleve.duree);
    return `
      <tr>
        <td>${eleve.nom}</td>
        <td>${eleve.prenom}</td>
        <td>${eleve.classe}</td>
        <td>${eleve.sexe}</td>
        <td>${eleve.distanceTotale.toFixed(2)}</td>
        <td>${vitesse}</td>
        <td>${eleve.vma ? eleve.vma : 'N/A'}</td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
}

function generateCSV() {
  if (!eleve1 || !eleve2) {
    alert('Pas de données disponibles.');
    return;
  }
  const header = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Distance réalisée (m)', 'Vitesse moyenne (km/h)', 'VMA estimée (km/h)'];
  const rows = [eleve1, eleve2].map(eleve => {
    const vitesse = kmh(eleve.distanceTotale, eleve.duree);
    return [
      eleve.nom,
      eleve.prenom,
      eleve.classe,
      eleve.sexe,
      eleve.distanceTotale.toFixed(2),
      vitesse,
      eleve.vma ? eleve.vma : 'N/A'
    ];
  });

  let csvContent = header.join(',') + '\n';
  rows.forEach(r => {
    csvContent += r.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bilan_RunStats.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function generateQR() {
  if (!eleve1 || !eleve2) {
    alert('Pas de données disponibles.');
    return;
  }
  // On prépare un résumé au format texte simple
  const data = [
    eleve1, eleve2
  ].map(eleve => {
    const vitesse = kmh(eleve.distanceTotale, eleve.duree);
    return `${eleve.prenom} ${eleve.nom} (${eleve.classe}, ${eleve.sexe})\nDistance: ${eleve.distanceTotale.toFixed(2)} m\nVitesse moyenne: ${vitesse} km/h\nVMA estimée: ${eleve.vma ? eleve.vma : 'N/A'} km/h`;
  }).join('\n\n');

  const canvas = document.getElementById('qrCanvas');
  canvas.style.display = 'block';

  QRCode.toCanvas(canvas, data, { width: 250 }, function (error) {
    if (error) {
      alert('Erreur génération QR code : ' + error);
      return;
    }
    // Une fois généré, on propose de sauvegarder l'image
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bilan_RunStats_QR.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  });
}

document.getElementById('downloadCSV').addEventListener('click', generateCSV);
document.getElementById('downloadQR').addEventListener('click', generateQR);

remplirTable();
