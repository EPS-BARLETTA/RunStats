// Récupérer les données stockées dans sessionStorage (ou localStorage selon ton implémentation)
const eleve1Data = JSON.parse(sessionStorage.getItem('eleve1Data')) || {};
const eleve2Data = JSON.parse(sessionStorage.getItem('eleve2Data')) || {};

// Fonction pour calculer vitesse moyenne km/h
function calcVitesseMoyenne(distanceM, dureeSec) {
  if (!dureeSec || dureeSec === 0) return 0;
  return ((distanceM / 1000) / (dureeSec / 3600)).toFixed(2);
}

// Fonction pour insérer les données dans le tableau
function afficherResultats() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  [eleve1Data, eleve2Data].forEach((eleve, idx) => {
    if (!eleve.nom) return; // ignorer si pas de données
    const dureeMin = (eleve.dureeSec / 60).toFixed(2);
    const vitesseMoy = calcVitesseMoyenne(eleve.distanceTotale, eleve.dureeSec);
    const vma = eleve.vmaEstimee ? eleve.vmaEstimee.toFixed(2) : '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eleve.prenom} ${eleve.nom} (${eleve.classe}) - ${eleve.sexe}</td>
      <td>${dureeMin}</td>
      <td>${eleve.distanceTotale.toFixed(2)}</td>
      <td>${vitesseMoy}</td>
      <td>${vma}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Génération et affichage QR code avec les données CSV encodées
function genererQRCode(csvData) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = '';
  QRCode.toCanvas(csvData, { width: 200, margin: 2 }, (error, canvas) => {
    if (error) {
      container.innerText = "Erreur génération QR Code";
      console.error(error);
      return;
    }
    container.appendChild(canvas);
  });
}

// Conversion des données en CSV
function convertirCSV() {
  const entetes = ['Nom', 'Prénom', 'Classe', 'Sexe', 'Durée(min)', 'Distance(m)', 'Vitesse moyenne(km/h)', 'VMA estimée(km/h)'];
  const lignes = [entetes.join(';')];

  [eleve1Data, eleve2Data].forEach(eleve => {
    if (!eleve.nom) return;
    const dureeMin = (eleve.dureeSec / 60).toFixed(2);
    const vitesseMoy = calcVitesseMoyenne(eleve.distanceTotale, eleve.dureeSec);
    const vma = eleve.vmaEstimee ? eleve.vmaEstimee.toFixed(2) : '-';

    const ligne = [
      eleve.nom,
      eleve.prenom,
      eleve.classe,
      eleve.sexe,
      dureeMin,
      eleve.distanceTotale.toFixed(2),
      vitesseMoy,
      vma
    ].join(';');
    lignes.push(ligne);
  });

  return lignes.join('\n');
}

// Téléchargement du CSV
function telechargerCSV() {
  const csv = convertirCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RunStats_Bilan.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event listeners pour les boutons
document.getElementById('downloadCsvBtn').addEventListener('click', telechargerCSV);
document.getElementById('downloadQrBtn').addEventListener('click', () => {
  const csv = convertirCSV();
  genererQRCode(csv);
});

// Initialisation affichage
afficherResultats();
