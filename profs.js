// profs.js

// Initialisation variables
const startScanBtn = document.getElementById('startScanBtn');
const videoElem = document.getElementById('video');
const elevesTableBody = document.querySelector('#elevesTable tbody');
const triSelect = document.getElementById('triSelect');
const rechercheInput = document.getElementById('rechercheInput');
const creerGroupesBtn = document.getElementById('creerGroupesBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');

const groupesSection = document.getElementById('groupesSection');
const groupesTableBody = document.querySelector('#groupesTable tbody');
const exportGroupesCSVBtn = document.getElementById('exportGroupesCSVBtn');

let html5QrCode;
let elevesData = [];  // tableau des élèves scannés
let groupesData = [];

function afficheEleves(data) {
  elevesTableBody.innerHTML = '';
  data.forEach(eleve => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eleve.nom}</td>
      <td>${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td>${eleve.vma?.toFixed(2) ?? '-'}</td>
      <td>${eleve.distance?.toFixed(2) ?? '-'}</td>
    `;
    elevesTableBody.appendChild(tr);
  });
}

function triEleves(critere) {
  let data = [...elevesData];
  switch(critere) {
    case 'alphabetique':
      data.sort((a,b) => a.nom.localeCompare(b.nom));
      break;
    case 'vma':
      data.sort((a,b) => (b.vma ?? 0) - (a.vma ?? 0));
      break;
    case 'sexe':
      data.sort((a,b) => a.sexe.localeCompare(b.sexe));
      break;
    case 'distance':
      data.sort((a,b) => (b.distance ?? 0) - (a.distance ?? 0));
      break;
    case 'classe':
      data.sort((a,b) => a.classe.localeCompare(b.classe));
      break;
  }
  afficheEleves(data);
}

function filtreRecherche() {
  const query = rechercheInput.value.toLowerCase();
  const filtered = elevesData.filter(eleve =>
    eleve.nom.toLowerCase().includes(query) ||
    eleve.prenom.toLowerCase().includes(query) ||
    eleve.classe.toLowerCase().includes(query) ||
    eleve.sexe.toLowerCase().includes(query)
  );
  afficheEleves(filtered);
}

function creerGroupes() {
  groupesData = [];
  // Créer groupes de 2 élèves (par exemple ordre d'apparition)
  for(let i = 0; i < elevesData.length; i += 2) {
    const groupeNum = (i/2) + 1;
    groupesData.push({
      groupe: groupeNum,
      nom: elevesData[i].nom,
      prenom: elevesData[i].prenom,
      classe: elevesData[i].classe,
      sexe: elevesData[i].sexe,
      vma: elevesData[i].vma,
      distance: elevesData[i].distance
    });
    if(elevesData[i+1]) {
      groupesData.push({
        groupe: groupeNum,
        nom: elevesData[i+1].nom,
        prenom: elevesData[i+1].prenom,
        classe: elevesData[i+1].classe,
        sexe: elevesData[i+1].sexe,
        vma: elevesData[i+1].vma,
        distance: elevesData[i+1].distance
      });
    }
  }
  afficherGroupes();
}

function afficherGroupes() {
  groupesSection.style.display = 'block';
  groupesTableBody.innerHTML = '';
  groupesData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.groupe}</td>
      <td>${item.nom}</td>
      <td>${item.prenom}</td>
      <td>${item.classe}</td>
      <td>${item.sexe}</td>
      <td>${item.vma?.toFixed(2) ?? '-'}</td>
      <td>${item.distance?.toFixed(2) ?? '-'}</td>
    `;
    groupesTableBody.appendChild(tr);
  });
}

function exportCSV(data, filename) {
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(';'));
  data.forEach(row => {
    const values = headers.map(header => (row[header] ?? '').toString().replace(/;/g, ','));
    csvRows.push(values.join(';'));
  });
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Gestion du scan QR code

startScanBtn.addEventListener('click', () => {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("video");
  }
  videoElem.style.display = "block";
  startScanBtn.disabled = true;

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    qrCodeMessage => {
      try {
        const data = JSON.parse(qrCodeMessage);
        if(data.nom && data.prenom) {
          // Eviter doublon sur nom+prenom+classe
          const exists = elevesData.some(e => e.nom === data.nom && e.prenom === data.prenom && e.classe === data.classe);
          if(!exists){
            elevesData.push(data);
            triEleves(triSelect.value);
          }
          alert(`Données ajoutées pour ${data.prenom} ${data.nom}`);
        }
      } catch(e) {
        alert('QR Code invalide ou non reconnu');
      }
      // Arrêt du scan après lecture
      html5QrCode.stop().then(() => {
        videoElem.style.display = "none";
        startScanBtn.disabled = false;
      }).catch(err => {
        console.error(err);
      });
    },
    errorMessage => {
      // ignore les erreurs silencieuses du scan
    }
  ).catch(err => {
    alert('Erreur lors du démarrage du scan: ' + err);
    startScanBtn.disabled = false;
  });
});

triSelect.addEventListener('change', () => {
  triEleves(triSelect.value);
});

rechercheInput.addEventListener('input', filtreRecherche);

creerGroupesBtn.addEventListener('click', () => {
  if(elevesData.length < 2) {
    alert("Il faut au moins deux élèves pour créer des groupes.");
    return;
  }
  creerGroupes();
});

exportCSVBtn.addEventListener('click', () => {
  if(elevesData.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }
  exportCSV(elevesData, "eleves.csv");
});

exportGroupesCSVBtn.addEventListener('click', () => {
  if(groupesData.length === 0) {
    alert("Aucun groupe à exporter.");
    return;
  }
  exportCSV(groupesData, "groupes.csv");
});

// Affiche tableau vide au départ
afficheEleves(elevesData);

