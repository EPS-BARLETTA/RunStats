// profs.js

const pinInput = document.getElementById('pinInput');
const pinSubmit = document.getElementById('pinSubmit');
const accessSection = document.getElementById('accessSection');
const dataSection = document.getElementById('dataSection');
const tableContainer = document.getElementById('tableContainer');
const sortSelect = document.getElementById('sortSelect');
const groupBtn = document.getElementById('groupBtn');
const exportBtn = document.getElementById('exportBtn');
const messageDiv = document.getElementById('message');

let allResults = []; // données collectées
let currentResults = []; // affichées selon tri

function loadResults() {
  const saved = localStorage.getItem('runsData');
  allResults = saved ? JSON.parse(saved) : [];
  currentResults = [...allResults];
}

function saveResults() {
  localStorage.setItem('runsData', JSON.stringify(allResults));
}

function checkPin() {
  if (pinInput.value === "EPS76") {
    accessSection.style.display = 'none';
    dataSection.style.display = 'block';
    loadResults();
    renderTable(currentResults);
  } else {
    alert('Code PIN incorrect.');
  }
}

function renderTable(data) {
  if (data.length === 0) {
    tableContainer.innerHTML = "<p>Aucune donnée disponible.</p>";
    return;
  }
  let html = `<table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align:center;">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Classe</th>
        <th>Sexe</th>
        <th>Distance (m)</th>
        <th>VMA estimée (km/h)</th>
      </tr>
    </thead><tbody>`;

  for (const r of data) {
    html += `<tr>
      <td>${r.nom}</td>
      <td>${r.prenom}</td>
      <td>${r.classe}</td>
      <td>${r.sexe}</td>
      <td>${r.distance}</td>
      <td>${r.vmaEstimee}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}

function sortData(criteria) {
  currentResults.sort((a,b) => {
    if (criteria === 'distance' || criteria === 'vma') {
      return parseFloat(b[criteria === 'distance' ? 'distance' : 'vmaEstimee']) - parseFloat(a[criteria === 'distance' ? 'distance' : 'vmaEstimee']);
    } else if (criteria === 'sexe') {
      return a.sexe.localeCompare(b.sexe);
    }
    return 0;
  });
  renderTable(currentResults);
}

function createGroups() {
  if(currentResults.length === 0) {
    alert("Aucune donnée pour créer des groupes.");
    return;
  }

  // Trier par VMA décroissante
  const sorted = [...currentResults].sort((a,b) => parseFloat(b.vmaEstimee) - parseFloat(a.vmaEstimee));
  
  // Récupérer valeurs de VMA max, intermédiaire et faible (approximatif)
  const maxVMA = parseFloat(sorted[0].vmaEstimee);
  const minVMA = parseFloat(sorted[sorted.length-1].vmaEstimee);
  const midVMA = (maxVMA + minVMA) / 2;

  // Groupes: VMA élevée (>midVMA), intermédiaire (entre min et mid), faible (<min+quart)
  const groups = {
    elevees: [],
    intermédiaires: [],
    faibles: [],
  };

  sorted.forEach(r => {
    const vma = parseFloat(r.vmaEstimee);
    if (vma >= midVMA) groups.elevees.push(r);
    else if (vma >= (minVMA + (midVMA - minVMA) / 2)) groups.intermédiaires.push(r);
    else groups.faibles.push(r);
  });

  // Affichage simplifié
  let html = `<h3>Groupes créés selon VMA estimée</h3>`;
  html += `<h4>VMA Élevée (${groups.elevees.length}):</h4><ul>`;
  groups.elevees.forEach(r => html += `<li>${r.nom} ${r.prenom} - ${r.vmaEstimee} km/h</li>`);
  html += `</ul><h4>VMA Intermédiaire (${groups.intermédiaires.length}):</h4><ul>`;
  groups.intermédiaires.forEach(r => html += `<li>${r.nom} ${r.prenom} - ${r.vmaEstimee} km/h</li>`);
  html += `</ul><h4>VMA Faible (${groups.faibles.length}):</h4><ul>`;
  groups.faibles.forEach(r => html += `<li>${r.nom} ${r.prenom} - ${r.vmaEstimee} km/h</li>`);
  html += `</ul>`;

  tableContainer.innerHTML = html;
}

function exportCSV() {
  if(currentResults.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }
  let csv = "Nom,Prénom,Classe,Sexe,Distance (m),VMA estimée (km/h)\n";
  currentResults.forEach(r => {
    csv += `"${r.nom}","${r.prenom}","${r.classe}","${r.sexe}","${r.distance}","${r.vmaEstimee}"\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'resultats_runs.csv';
  a.click();

  URL.revokeObjectURL(url);
}

pinSubmit.addEventListener('click', checkPin);
sortSelect.addEventListener('change', e => sortData(e.target.value));
groupBtn.addEventListener('click', createGroups);
exportBtn.addEventListener('click', exportCSV);
