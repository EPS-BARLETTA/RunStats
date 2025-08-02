// prof.js

const PIN_CODE = 'EPS76';

const loginSection = document.getElementById('loginSection');
const pinInput = document.getElementById('pinInput');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');

const dataSection = document.getElementById('dataSection');
const logoutBtn = document.getElementById('logoutBtn');

const resultsTableBody = document.querySelector('#resultsTable tbody');

const sortDistanceBtn = document.getElementById('sortDistance');
const sortVmaBtn = document.getElementById('sortVMA');
const sortSexeBtn = document.getElementById('sortSexe');
const createGroupsBtn = document.getElementById('createGroups');
const exportCSVBtn = document.getElementById('exportCSV');

let results = [];
let currentSort = null;

// Affiche message erreur
function showError(msg) {
  loginMessage.textContent = msg;
}

// Efface message erreur
function clearError() {
  loginMessage.textContent = '';
}

// Afficher données dans tableau
function afficherTableau(data) {
  resultsTableBody.innerHTML = '';
  data.forEach(groupe => {
    groupe.eleves.forEach(eleve => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${eleve.nom}</td>
        <td>${eleve.prenom}</td>
        <td>${eleve.classe}</td>
        <td>${eleve.sexe}</td>
        <td>${eleve.distanceParcourue ?? groupe.totalDistance}</td>
        <td>${eleve.vmaEstimee ?? groupe.vmaEstimee.toFixed(2)}</td>
      `;
      resultsTableBody.appendChild(tr);
    });
  });
}

// Charger résultats depuis localStorage
function chargerResultats() {
  const stored = localStorage.getItem('runstats_results');
  if (stored) {
    let allResults = JSON.parse(stored);

    // Transformer en tableau d’objets pour affichage
    // Chaque entrée = un groupe avec 2 élèves
    results = allResults.map(r => ({
      eleves: r.eleves.map((e, i) => ({
        ...e,
        distanceParcourue: r.tours * r.distanceTour,
        vmaEstimee: r.vmaEstimee,
      })),
      totalDistance: r.tours * r.distanceTour,
      vmaEstimee: r.vmaEstimee,
    }));

    afficherTableau(results);
  } else {
    resultsTableBody.innerHTML = '<tr><td colspan="6">Aucun résultat trouvé.</td></tr>';
  }
}

// Trier tableau
function trierTableau(critere) {
  if (!results.length) return;

  switch (critere) {
    case 'distance':
      results.sort((a,b) => (b.totalDistance || 0) - (a.totalDistance || 0));
      break;
    case 'vma':
      results.sort((a,b) => (b.vmaEstimee || 0) - (a.vmaEstimee || 0));
      break;
    case 'sexe':
      // Trier par premier élève sexe
      results.sort((a,b) => a.eleves[0].sexe.localeCompare(b.eleves[0].sexe));
      break;
  }
  afficherTableau(results);
  currentSort = critere;
}

// Créer groupes équilibrés
function creerGroupesEquilibres() {
  // On va prendre tous les élèves de tous les groupes,
  // les trier par VMA décroissante et sexe, puis créer
  // de nouveaux groupes équilibrés par paires.

  // Extraire tous les élèves
  const tousEleves = [];
  results.forEach(groupe => {
    groupe.eleves.forEach(e => {
      tousEleves.push({
        ...e,
        vma: e.vmaEstimee,
      });
    });
  });

  if (tousEleves.length < 2) {
    alert('Pas assez d’élèves pour créer des groupes.');
    return;
  }

  // Trier par sexe, puis vma décroissante
  tousEleves.sort((a,b) => {
    if (a.sexe === b.sexe) {
      return b.vma - a.vma;
    }
    return a.sexe.localeCompare(b.sexe);
  });

  // Former paires (groupes)
  const nouveauxGroupes = [];
  for (let i=0; i<tousEleves.length; i+=2) {
    if (i+1 < tousEleves.length) {
      nouveauxGroupes.push({
        eleves: [tousEleves[i], tousEleves[i+1]],
        totalDistance: 0,
        vmaEstimee: 0
      });
    }
  }

  // Mettre à jour résultats
  results = nouveauxGroupes;
  afficherTableau(results);
}

// Export CSV
function exporterCSV() {
  if (!results.length) {
    alert('Aucun résultat à exporter.');
    return;
  }

  let csv = 'Nom,Prénom,Classe,Sexe,Distance (m),VMA Estimée (km/h)\n';

  results.forEach(groupe => {
    groupe.eleves.forEach(eleve => {
      csv += `${eleve.nom},${eleve.prenom},${eleve.classe},${eleve.sexe},${eleve.distanceParcourue},${eleve.vmaEstimee.toFixed(2)}\n`;
    });
  });

  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'runstats_resultats.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Gestion login/logout
loginBtn.addEventListener('click', () => {
  const pin = pinInput.value.trim();
  if (pin === PIN_CODE) {
    clearError();
    loginSection.classList.add('hidden');
    dataSection.classList.remove('hidden');
    chargerResultats();
  } else {
    showError('Code PIN incorrect.');
  }
});

logoutBtn.addEventListener('click', () => {
  dataSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  pinInput.value = '';
  loginMessage.textContent = '';
  resultsTableBody.innerHTML = '';
  results = [];
});

sortDistanceBtn.addEventListener('click', () => trierTableau('distance'));
sortVmaBtn.addEventListener('click', () => trierTableau('vma'));
sortSexeBtn.addEventListener('click', () => trierTableau('sexe'));
createGroupsBtn.addEventListener('click', creerGroupesEquilibres);
exportCSVBtn.addEventListener('click', exporterCSV);
