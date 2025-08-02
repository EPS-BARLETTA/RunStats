// Récupération des données des deux élèves depuis sessionStorage
const eleve1 = JSON.parse(sessionStorage.getItem('eleve1'));
const eleve2 = JSON.parse(sessionStorage.getItem('eleve2'));

const tbody = document.querySelector('#bilan-table tbody');
const qrContainer = document.getElementById('qr-code');

function kmh(distanceMeters, durationSeconds) {
  // km/h = (distance en m / 1000) / (temps en h)
  return (distanceMeters / 1000) / (durationSeconds / 3600);
}

function afficherBilan() {
  if (!eleve1 || !eleve2) {
    tbody.innerHTML = '<tr><td colspan="8">Aucune donnée disponible</td></tr>';
    return;
  }

  const eleves = [eleve1, eleve2];
  tbody.innerHTML = '';

  eleves.forEach((eleve, i) => {
    // Calcul vitesse moyenne et VMA estimée
    const vitesseMoy = kmh(eleve.distanceTotal, eleve.duree);
    // VMA estimation simplifiée: on ajoute 0.5 km/h à la vitesse moyenne pour simuler l'estimation
    const vmaEstimee = eleve.vma ? eleve.vma : (vitesseMoy + 0.5).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Élève ${i + 1}</td>
      <td>${eleve.nom}</td>
      <td>${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td>${eleve.distanceTotal.toFixed(2)}</td>
      <td>${vitesseMoy.toFixed(2)}</td>
      <td>${vmaEstimee}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export CSV
function exportCSV() {
  const headers = ['Élève', 'Nom', 'Prénom', 'Classe', 'Sexe', 'Distance (m)', 'Vitesse Moyenne (km/h)', 'VMA estimée (km/h)'];
  const eleves = [eleve1, eleve2];

  const rows = eleves.map((eleve, i) => {
    const vitesseMoy = kmh(eleve.distanceTotal, eleve.duree);
    const vmaEstimee = eleve.vma ? eleve.vma : (vitesseMoy + 0.5).toFixed(2);

    return [
      `Élève ${i + 1}`,
      eleve.nom,
      eleve.prenom,
      eleve.classe,
      eleve.sexe,
      eleve.distanceTotal.toFixed(2),
      vitesseMoy.toFixed(2),
      vmaEstimee
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'bilan_courses.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Génération QR code avec résumé des données
function generateQRCode() {
  qrContainer.innerHTML = ''; // reset

  const eleves = [eleve1, eleve2];
  let text = 'Bilan courses:\n';

  eleves.forEach((eleve, i) => {
    const vitesseMoy = kmh(eleve.distanceTotal, eleve.duree);
    const vmaEstimee = eleve.vma ? eleve.vma : (vitesseMoy + 0.5).toFixed(2);

    text += `Élève ${i + 1} - ${eleve.prenom} ${eleve.nom}\n`;
    text += `Classe: ${eleve.classe}, Sexe: ${eleve.sexe}\n`;
    text += `Distance: ${eleve.distanceTotal.toFixed(2)} m\n`;
    text += `Vitesse Moyenne: ${vitesseMoy.toFixed(2)} km/h\n`;
    text += `VMA Estimée: ${vmaEstimee} km/h\n\n`;
  });

  QRCode.toCanvas(text, { width: 200, margin: 2 }, function (error, canvas) {
    if (error) {
      console.error(error);
      qrContainer.textContent = 'Erreur de génération du QR code';
      return;
    }
    qrContainer.appendChild(canvas);
  });
}

document.getElementById('download-csv').addEventListener('click', exportCSV);
document.getElementById('download-qr').addEventListener('click', generateQRCode);

window.onload = afficherBilan;
