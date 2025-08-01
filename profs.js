// profs.js

const pinBtn = document.getElementById('pinBtn');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const loginSection = document.getElementById('loginSection');
const profSection = document.getElementById('profSection');
const resultsTable = document.querySelector('#resultsTable tbody');
const groupsContainer = document.getElementById('groupsContainer');

// PIN de sécurité
const PIN = "EPS76";

// Récupération des données existantes
let results = JSON.parse(localStorage.getItem('results')) || [];

// Vérification PIN
pinBtn.addEventListener('click', () => {
  if (pinInput.value === PIN) {
    loginSection.style.display = 'none';
    profSection.style.display = 'block';
    displayResults();
  } else {
    pinError.textContent = "Code PIN incorrect.";
  }
});

// Afficher tableau
function displayResults() {
  resultsTable.innerHTML = "";
  results.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.nom}</td>
      <td>${r.prenom}</td>
      <td>${r.classe}</td>
      <td>${r.sexe}</td>
      <td>${r.distance}</td>
      <td>${r.vma.toFixed(1)}</td>
    `;
    resultsTable.appendChild(row);
  });
}

// Ajouter via QR code
document.getElementById('addQRBtn').addEventListener('click', () => {
  const qrData = document.getElementById('qrInput').value;
  if (!qrData) {
    alert("Collez le contenu du QR code !");
    return;
  }
  addResultFromQR(qrData);
  document.getElementById('qrInput').value = '';
});

// Traitement des données QR
function addResultFromQR(data) {
  try {
    const parsed = JSON.parse(data);

    // Ajout élève 1
    results.push({
      nom: parsed.eleve1.nom,
      prenom: parsed.eleve1.prenom,
      classe: parsed.eleve1.classe,
      sexe: parsed.eleve1.sexe,
      distance: parsed.eleve1.distance,
      vma: calcVMA(parsed.eleve1.distance)
    });

    // Ajout élève 2
    results.push({
      nom: parsed.eleve2.nom,
      prenom: parsed.eleve2.prenom,
      classe: parsed.eleve2.classe,
      sexe: parsed.eleve2.sexe,
      distance: parsed.eleve2.distance,
      vma: calcVMA(parsed.eleve2.distance)
    });

    // Sauvegarde
    localStorage.setItem('results', JSON.stringify(results));
    displayResults();
  } catch (e) {
    alert("QR code invalide !");
  }
}

// Calcul estimation VMA
function calcVMA(distance) {
  // VMA estimée = distance sur 6 min convertie en km/h (ici distance totale)
  return (distance / 1000) / (12 / 60);
}

// Boutons de tri
document.getElementById('sortDistance').addEventListener('click', () => {
  results.sort((a, b) => b.distance - a.distance);
  displayResults();
});

document.getElementById('sortVMA').addEventListener('click', () => {
  results.sort((a, b) => b.vma - a.vma);
  displayResults();
});

document.getElementById('sortSexe').addEventListener('click', () => {
  results.sort((a, b) => a.sexe.localeCompare(b.sexe));
  displayResults();
});

// Bouton export
document.getElementById('exportBtn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "resultats_RunStats.json");
  dlAnchor.click();
});
