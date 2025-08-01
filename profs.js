// profs.js

let scanner;
let videoElem = document.getElementById('video');
let startScanBtn = document.getElementById('startScanBtn');
let elevesData = [];
let groupesData = [];

startScanBtn.addEventListener('click', () => {
  if (scanner) {
    scanner.stop();
    scanner = null;
    startScanBtn.textContent = 'Démarrer le scan';
    videoElem.style.display = 'none';
  } else {
    startScanBtn.textContent = 'Arrêter le scan';
    videoElem.style.display = 'block';
    startScanner();
  }
});

function startScanner() {
  scanner = new Html5QrcodeScanner(
    "video", 
    { fps: 10, qrbox: 250 },
    /* verbose= */ false
  );
  scanner.render(onScanSuccess, onScanError);
}

function onScanSuccess(decodedText, decodedResult) {
  try {
    let data = JSON.parse(decodedText);
    // Si c'est un groupe (2 élèves)
    if (data.eleves && Array.isArray(data.eleves)) {
      groupesData.push(data);
      updateGroupesTable();
    } else {
      // Sinon données élèves simples
      elevesData.push(data);
      updateElevesTable();
    }
  } catch(e) {
    console.warn('QR code non JSON ou non valide', e);
  }
}

function onScanError(error) {
  // Pas besoin d'afficher chaque erreur
}

function updateElevesTable() {
  let tbody = document.querySelector('#elevesTable tbody');
  tbody.innerHTML = '';
  elevesData.forEach((eleve, i) => {
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eleve.nom || ''}</td>
      <td>${eleve.prenom || ''}</td>
      <td>${eleve.classe || ''}</td>
      <td>${eleve.sexe || ''}</td>
      <td>${eleve.distanceTotale || ''} m</td>
      <td>${eleve.vitesseMoyenne ? eleve.vitesseMoyenne.toFixed(2) : ''} km/h</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateGroupesTable() {
  let tbody = document.querySelector('#groupesTable tbody');
  tbody.innerHTML = '';
  groupesData.forEach((groupe, i) => {
    let eleve1 = groupe.eleves[0] || {};
    let eleve2 = groupe.eleves[1] || {};
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eleve1.nom || ''} ${eleve1.prenom || ''}</td>
      <td>${eleve2.nom || ''} ${eleve2.prenom || ''}</td>
      <td>${groupe.distanceTotale || ''} m</td>
      <td>${groupe.vitesseMoyenne ? groupe.vitesseMoyenne.toFixed(2) : ''} km/h</td>
    `;
    tbody.appendChild(tr);
  });
}

// Trier les tableaux par colonne (exemple simple)
document.querySelectorAll('th.sortable').forEach(header => {
  header.addEventListener('click', () => {
    let tableId = header.closest('table').id;
    let colIndex = Array.from(header.parentNode.children).indexOf(header);
    let asc = header.dataset.asc === 'true';
    header.dataset.asc = !asc;

    if(tableId === 'elevesTable') {
      elevesData.sort((a,b) => {
        let valA = Object.values(a)[colIndex];
        let valB = Object.values(b)[colIndex];
        return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
      updateElevesTable();
    } else if(tableId === 'groupesTable') {
      groupesData.sort((a,b) => {
        let valA = colIndex === 0 ? (a.eleves[0].nom || '') : 
                   colIndex === 1 ? (a.eleves[1].nom || '') : 
                   Object.values(a)[colIndex - 2];
        let valB = colIndex === 0 ? (b.eleves[0].nom || '') : 
                   colIndex === 1 ? (b.eleves[1].nom || '') : 
                   Object.values(b)[colIndex - 2];
        return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
      updateGroupesTable();
    }
  });
});

// Export CSV pour élève et groupes
document.getElementById('exportCSVBtn').addEventListener('click', () => {
  exportToCSV(elevesData, 'eleves.csv');
});

document.getElementById('exportGroupesCSVBtn').addEventListener('click', () => {
  exportToCSV(groupesData, 'groupes.csv');
});

function exportToCSV(data, filename) {
  if(!data.length) return alert('Aucune donnée à exporter');
  let csv = '';
  const keys = Object.keys(data[0]);
  if(data[0].eleves) { // Groupe
    csv += 'Eleve 1,Eleve 2,Distance Totale,Vitesse Moyenne\n';
    data.forEach(g => {
      let e1 = g.eleves[0] ? `${g.eleves[0].nom} ${g.eleves[0].prenom}` : '';
      let e2 = g.eleves[1] ? `${g.eleves[1].nom} ${g.eleves[1].prenom}` : '';
      csv += `"${e1}","${e2}",${g.distanceTotale || ''},${g.vitesseMoyenne || ''}\n`;
    });
  } else {
    csv += keys.join(',') + '\n';
    data.forEach(row => {
      csv += keys.map(k => `"${row[k] || ''}"`).join(',') + '\n';
    });
  }
  let blob = new Blob([csv], {type: 'text/csv'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
