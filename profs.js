// profs.js

// --- Accès sécurisé par code PIN ---
const pinBtn = document.getElementById('pinBtn');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const loginSection = document.getElementById('loginSection');
const profSection = document.getElementById('profSection');

pinBtn.addEventListener('click', () => {
  if (pinInput.value === "EPS76") {
    loginSection.style.display = "none";
    profSection.style.display = "block";
    loadResults();
  } else {
    pinError.textContent = "Code PIN incorrect.";
  }
});

// --- Gestion des données ---
let results = [];

// Charger données existantes
function loadResults() {
  const saved = localStorage.getItem('runstats_results');
  results = saved ? JSON.parse(saved) : [];
  renderTable();
}

// Sauvegarder
function saveResults() {
  localStorage.setItem('runstats_results', JSON.stringify(results));
}

// Ajouter données via QR code (simulation)
function addResultFromQR(qrData) {
  try {
    const data = JSON.parse(qrData);
    results.push(data.eleve1);
    results.push(data.eleve2);
    saveResults();
    renderTable();
  } catch (e) {
    alert("QR code invalide !");
  }
}

// --- Afficher tableau ---
const tableBody = document.querySelector('#resultsTable tbody');

function renderTable() {
  tableBody.innerHTML = '';
  results.forEach(el => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${el.nom}</td>
      <td>${el.prenom}</td>
      <td>${el.classe}</td>
      <td>${el.sexe}</td>
      <td>${el.distance}</td>
      <td>${(el.distance/1000/(12/60)).toFixed(1)}</td>
    `;
    tableBody.appendChild(row);
  });
}

// --- Tri ---
document.getElementById('sortDistance').addEventListener('click', () => {
  results.sort((a, b) => b.distance - a.distance);
  renderTable();
});

document.getElementById('sortVMA').addEventListener('click', () => {
  results.sort((a, b) => {
    const vmaA = a.distance/1000/(12/60);
    const vmaB = b.distance/1000/(12/60);
    return vmaB - vmaA;
  });
  renderTable();
});

document.getElementById('sortSexe').addEventListener('click', () => {
  results.sort((a, b) => a.sexe.localeCompare(b.sexe));
  renderTable();
});

// --- Export JSON ---
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resultats_runstats.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// --- Création groupes mixtes (VMA haute/intermédiaire/faible) ---
document.getElementById('createGroups').addEventListener('click', () => {
  if (results.length < 4) {
    alert("Pas assez de données pour créer des groupes.");
    return;
  }

  // Calcul VMA
  const sorted = results.map(r => ({
    ...r,
    vma: r.distance/1000/(12/60) // estimation VMA
  })).sort((a, b) => b.vma - a.vma);

  const groupes = [];
  while (sorted.length >= 4) {
    const groupe = [
      sorted.shift(),             // VMA haute
      sorted.splice(1, 1)[0],     // intermédiaire
      sorted.splice(1, 1)[0],     // intermédiaire
      sorted.pop()                // VMA faible
    ];
    groupes.push(groupe);
  }

  // Affichage
  const container = document.getElementById('groupsOutput');
  container.innerHTML = '';
  groupes.forEach((g, i) => {
    const div = document.createElement('div');
    div.classList.add('group-box');
    div.innerHTML = `<h4>Groupe ${i+1}</h4>` +
      g.map(e => `<p>${e.prenom} ${e.nom} (${e.classe}) - VMA: ${e.vma.toFixed(1)} km/h</p>`).join('');
    container.appendChild(div);
  });
});

// --- Simulation ajout QR code ---
// Pour tester rapidement, ouvrir la console et taper :
// addResultFromQR('{"eleve1":{"nom":"Dupont","prenom":"Jean","classe":"2A","sexe":"garçon","distance":1200},"eleve2":{"nom":"Durand","prenom":"Marie","classe":"2A","sexe":"fille","distance":1500}}');
