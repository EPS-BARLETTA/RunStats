// --- Variables globales ---

// État général
let chronoInterval = null;
let chronoTime = 0; // en secondes
let running = false;
let laps = 0;
let totalDistance = 0;
let vitesseInstantanee = 0;
let vmaEstimee = 0;

let currentRun = 1; // 1 ou 2
let runData = []; // Stocke les données des 2 courses des 2 élèves

// Élèves info
const eleves = [
  { nom: '', prenom: '', classe: '' },
  { nom: '', prenom: '', classe: '' }
];

// État forme (ressenti) pour les 2 courses
const etatsForme = ['', ''];

// Elements DOM
const chronoDisplay = document.getElementById('chronoDisplay');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsCount = document.getElementById('lapsCount');
const distanceTotalEl = document.getElementById('distanceTotal');
const distanceKmEl = document.getElementById('distanceKm');
const vitesseMoyEl = document.getElementById('vitesseMoy');
const vmaRealEl = document.getElementById('vmaReal');
const etatFormeSection = document.getElementById('etatForme');
const etatBtns = document.querySelectorAll('.etatBtn');
const qrContainer = document.getElementById('qrContainer');
const qrCodeBox = document.getElementById('qrCodeBox');

const profDashboard = document.getElementById('profDashboard');
const resultsBody = document.getElementById('resultsBody');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const generateGroupsBtn = document.getElementById('generateGroupsBtn');
const groupsDisplay = document.getElementById('groupsDisplay');
const qrReaderContainer = document.getElementById('qr-reader');
const stopScanBtn = document.getElementById('stopScanBtn');

const profAccessSection = document.getElementById('profAccess');
const profPinInput = document.getElementById('profPinInput');
const profPinSubmit = document.getElementById('profPinSubmit');
const logoutBtn = document.getElementById('logoutBtn');

// Input Élèves & course
const inputs = [
  {
    nom: document.getElementById('nom1'),
    prenom: document.getElementById('prenom1'),
    classe: document.getElementById('classe1'),
  },
  {
    nom: document.getElementById('nom2'),
    prenom: document.getElementById('prenom2'),
    classe: document.getElementById('classe2'),
  }
];
const dureeInput = document.getElementById('duree');
const distanceTourInput = document.getElementById('distanceTour');
const vmaRefInput = document.getElementById('vmaRef');

// QR & scan
let qrCode = null;
let html5QrScanner = null;

// Constantes
const PROF_CODE = '1234'; // Exemple, à changer selon besoin

// --- Fonctions ---

// Format temps mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Calcul vitesse moyenne km/h
function calcVitesseMoy(distanceM, dureeMin) {
  if (dureeMin === 0) return 0;
  return (distanceM / 1000) / (dureeMin / 60);
}

// Calcul VMA estimée, simple estimation: vitesse max atteinte durant laps (exemple)
function calcVMA(laps, distanceTour, chronoSeconds) {
  if (laps === 0 || chronoSeconds === 0) return 0;
  const distanceM = laps * distanceTour;
  const dureeMin = chronoSeconds / 60;
  return calcVitesseMoy(distanceM, dureeMin);
}

// Démarrer chrono
function startChrono() {
  if (running) return;
  if (!validateInputs()) {
    alert("Merci de remplir correctement tous les champs avant de démarrer.");
    return;
  }
  running = true;
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  etatFormeSection.style.display = 'none';
  qrContainer.style.display = 'none';

  const dureeSec = Math.floor(parseFloat(dureeInput.value) * 60);
  chronoTime = 0;
  laps = 0;
  totalDistance = 0;
  vitesseInstantanee = 0;
  vmaEstimee = 0;

  lapsCount.textContent = laps;
  distanceTotalEl.textContent = totalDistance;
  distanceKmEl.textContent = '0.00';
  vitesseMoyEl.textContent = '0.00';
  vmaRealEl.textContent = '0.00';
  chronoDisplay.textContent = formatTime(chronoTime);

  chronoInterval = setInterval(() => {
    chronoTime++;
    chronoDisplay.textContent = formatTime(chronoTime);

    // Si chrono atteint durée entrée, on stoppe
    if (chronoTime >= dureeSec) {
      stopChrono();
      return;
    }
  }, 1000);
}

// Stop chrono
function stopChrono() {
  running = false;
  clearInterval(chronoInterval);
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = false;

  // Calculs finaux
  vmaEstimee = calcVMA(laps, parseFloat(distanceTourInput.value), chronoTime);

  vitesseInstantanee = calcVitesseMoy(totalDistance, chronoTime / 60);

  distanceKmEl.textContent = (totalDistance / 1000).toFixed(2);
  vitesseMoyEl.textContent = vitesseInstantanee.toFixed(2);
  vmaRealEl.textContent = vmaEstimee.toFixed(2);

  etatFormeSection.style.display = 'block';
}

// Reset
function resetAll() {
  clearInterval(chronoInterval);
  chronoTime = 0;
  laps = 0;
  totalDistance = 0;
  vitesseInstantanee = 0;
  vmaEstimee = 0;
  running = false;
  currentRun = 1;
  runData.length = 0;
  etatFormeSection.style.display = 'none';
  qrContainer.style.display = 'none';

  lapsCount.textContent = '0';
  distanceTotalEl.textContent = '0';
  distanceKmEl.textContent = '0.00';
  vitesseMoyEl.textContent = '0.00';
  vmaRealEl.textContent = '0.00';
  chronoDisplay.textContent = '00:00';

  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;

  qrCodeBox.innerHTML = '';

  // Clear inputs for next run only if you want:
  // (comment if you want to keep them)
  // inputs.forEach(e => {
  //   e.nom.value = '';
  //   e.prenom.value = '';
  //   e.classe.value = '';
  // });
  // dureeInput.value = '';
  // distanceTourInput.value = '';
  // vmaRefInput.value = '';
}

// Ajouter un tour
function addLap() {
  if (!running) return;

  laps++;
  const distTour = parseFloat(distanceTourInput.value);
  totalDistance = laps * distTour;

  lapsCount.textContent = laps;
  distanceTotalEl.textContent = totalDistance;

  // Optionnel: calcul vitesse instantanée = distance / temps
  vitesseInstantanee = calcVitesseMoy(totalDistance, chronoTime / 60);

  distanceKmEl.textContent = (totalDistance / 1000).toFixed(2);
  vitesseMoyEl.textContent = vitesseInstantanee.toFixed(2);
}

// Valide inputs de base
function validateInputs() {
  for (let i = 0; i < 2; i++) {
    if (
      !inputs[i].nom.value.trim() ||
      !inputs[i].prenom.value.trim() ||
      !inputs[i].classe.value.trim()
    ) return false;
  }
  if (
    !dureeInput.value ||
    !distanceTourInput.value ||
    parseFloat(dureeInput.value) <= 0 ||
    parseFloat(distanceTourInput.value) <= 0
  ) return false;
  return true;
}

// Enregistrer les élèves infos dans objet global
function saveElevesInfo() {
  for (let i = 0; i < 2; i++) {
    eleves[i].nom = inputs[i].nom.value.trim();
    eleves[i].prenom = inputs[i].prenom.value.trim();
    eleves[i].classe = inputs[i].classe.value.trim();
  }
}

// Gestion du ressenti et QR code
function handleEtatClick(evt) {
  const etat = evt.target.getAttribute('data-etat');
  if (!etat) return;

  etatsForme[currentRun - 1] = etat;

  // Stocke les données de la course dans runData
  saveElevesInfo();

  // Données de la course
  const duree = parseFloat(dureeInput.value);
  const distanceKm = (totalDistance / 1000).toFixed(2);
  const vitesse = vitesseInstantanee.toFixed(2);
  const vmaEst = vmaEstimee.toFixed(2);

  runData[currentRun - 1] = {
    eleves: [...eleves], // copie tableau d'élèves
    duree,
    distance: totalDistance,
    distanceKm,
    vitesse,
    vmaEst,
    etat,
  };

  if (currentRun === 1) {
    // Prépare la 2e course
    currentRun = 2;

    // Reset chrono, laps, distances etc
    laps = 0;
    totalDistance = 0;
    vitesseInstantanee = 0;
    vmaEstimee = 0;
    chronoTime = 0;

    lapsCount.textContent = '0';
    distanceTotalEl.textContent = '0';
    distanceKmEl.textContent = '0.00';
        vitesseMoyEl.textContent = '0.00';
    vmaRealEl.textContent = '0.00';
    chronoDisplay.textContent = '00:00';

    startBtn.disabled = false;
    lapBtn.disabled = true;
    resetBtn.disabled = false;

    etatFormeSection.style.display = 'none';
    qrContainer.style.display = 'none';

    alert('Première course terminée. Maintenant, inversez les rôles et lancez la deuxième course.');
  } else {
    // Fin des deux courses => génération QR Code
    generateFinalQRCode();
  }
}

// Génération du QR code avec données des deux courses
function generateFinalQRCode() {
  qrContainer.style.display = 'block';
  qrCodeBox.innerHTML = '';

  // Format JSON simplifié avec toutes données utiles
  const dataToEncode = {
    run1: runData[0],
    run2: runData[1]
  };

  qrCode = new QRCode(qrCodeBox, {
    text: JSON.stringify(dataToEncode),
    width: 256,
    height: 256
  });
}

// --- Partie Professeur ---

// Variables pour stockage données reçues
let scannedResults = [];

// Fonction pour démarrer scanner QR
function startQRScanner() {
  if (html5QrScanner) {
    html5QrScanner.clear();
    html5QrScanner = null;
  }
  html5QrScanner = new Html5Qrcode("qr-reader");

  html5QrScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      try {
        const parsed = JSON.parse(decodedText);
        if (!parsed.run1 || !parsed.run2) throw 'Format invalide';

        scannedResults.push(parsed);
        alert('Données scannées et enregistrées.');

        // Met à jour tableau affichage
        updateResultsTable();
      } catch (e) {
        console.error('Erreur données scannées:', e);
        alert('QR Code invalide ou format incorrect.');
      }
    },
    (error) => {
      // console.log("Scan error", error);
    }
  ).catch((err) => {
    alert('Impossible de démarrer le scan : ' + err);
  });
}

// Arrêter scanner
function stopQRScanner() {
  if (html5QrScanner) {
    html5QrScanner.stop().then(() => {
      html5QrScanner.clear();
      html5QrScanner = null;
    }).catch(e => console.error(e));
  }
}

// Mise à jour tableau résultats avec les données scannées
function updateResultsTable() {
  resultsBody.innerHTML = '';

  scannedResults.forEach((result, idx) => {
    [result.run1, result.run2].forEach((run, i) => {
      run.eleves.forEach((eleve) => {
        const tr = document.createElement('tr');

        // Groupe à remplir plus tard, pour l'instant vide
        const tdGroup = document.createElement('td');
        tdGroup.textContent = '';
        tr.appendChild(tdGroup);

        const tdNom = document.createElement('td');
        tdNom.textContent = eleve.nom;
        tr.appendChild(tdNom);

        const tdPrenom = document.createElement('td');
        tdPrenom.textContent = eleve.prenom;
        tr.appendChild(tdPrenom);

        const tdClasse = document.createElement('td');
        tdClasse.textContent = eleve.classe;
        tr.appendChild(tdClasse);

        const tdDuree = document.createElement('td');
        tdDuree.textContent = run.duree;
        tr.appendChild(tdDuree);

        const tdDistance = document.createElement('td');
        tdDistance.textContent = run.distance;
        tr.appendChild(tdDistance);

        const tdVitesse = document.createElement('td');
        tdVitesse.textContent = run.vitesse;
        tr.appendChild(tdVitesse);

        const tdVma = document.createElement('td');
        tdVma.textContent = run.vmaEst;
        tr.appendChild(tdVma);

        const tdEtat = document.createElement('td');
        tdEtat.textContent = run.etat;
        tr.appendChild(tdEtat);

        resultsBody.appendChild(tr);
      });
    });
  });
}

// Export CSV fonction
function exportCSV() {
  if (scannedResults.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  let csv = 'Groupe,Nom,Prénom,Classe,Durée (min),Distance (m),Vitesse (km/h),VMA (km/h),État\n';

  scannedResults.forEach((result, idx) => {
    [result.run1, result.run2].forEach((run, i) => {
      run.eleves.forEach((eleve) => {
        csv += `${''},${eleve.nom},${eleve.prenom},${eleve.classe},${run.duree},${run.distance},${run.vitesse},${run.vmaEst},${run.etat}\n`;
      });
    });
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'runstats_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// --- Création groupes équilibrés ---

function generateGroups() {
  if (scannedResults.length === 0) {
    alert("Pas de données scannées pour créer les groupes.");
    return;
  }

  // Rassembler tous les élèves avec VMA moyenne entre les 2 courses (ou VMA max)
  let allEleves = [];

  scannedResults.forEach((result) => {
    [result.run1, result.run2].forEach((run) => {
      run.eleves.forEach((eleve) => {
        allEleves.push({
          nom: eleve.nom,
          prenom: eleve.prenom,
          classe: eleve.classe,
          vma: parseFloat(run.vmaEst),
        });
      });
    });
  });

  // Trier élèves par VMA décroissante
  allEleves.sort((a, b) => b.vma - a.vma);

  // Définir nombre groupes de 4 (si pas multiple, certains groupes auront moins)
  const groupSize = 4;
  const nbGroups = Math.ceil(allEleves.length / groupSize);

  // Création groupes vides
  let groups = Array.from({ length: nbGroups }, () => []);

  // Répartition pour équilibrer VMA
  // Méthode : premier élève (plus fort) dans groupe 1, second dans groupe nbGroups, troisième groupe 2, quatrième groupe nbGroups -1 etc en zigzag

  let ascending = true;
  let idxGroup = 0;

  allEleves.forEach((eleve) => {
    groups[idxGroup].push(eleve);

    if (ascending) {
      idxGroup++;
      if (idxGroup === nbGroups) {
        idxGroup = nbGroups - 1;
        ascending = false;
      }
    } else {
      idxGroup--;
      if (idxGroup < 0) {
        idxGroup = 0;
        ascending = true;
      }
    }
  });

  // Affichage groupes
  groupsDisplay.innerHTML = '<h3>Groupes créés</h3>';
  groups.forEach((group, i) => {
    const div = document.createElement('div');
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.margin = '10px 0';
    div.style.background = '#f9f9f9';

    const title = document.createElement('h4');
    title.textContent = `Groupe ${i + 1}`;
    div.appendChild(title);

    group.forEach((eleve) => {
      const p = document.createElement('p');
      p.textContent = `${eleve.nom} ${eleve.prenom} - Classe: ${eleve.classe} - VMA: ${eleve.vma.toFixed(2)}`;
      div.appendChild(p);
    });

    groupsDisplay.appendChild(div);
  });

  // Mettre à jour tableau avec numéro groupe
  updateResultsTableWithGroups(groups);
}

// Met à jour le tableau résultat avec groupes attribués
function updateResultsTableWithGroups(groups) {
  const rows = resultsBody.querySelectorAll('tr');
  rows.forEach((row) => {
    const nom = row.children[1].textContent;
    const prenom = row.children[2].textContent;

    // Chercher le groupe contenant cet élève
    let groupeNumber = '';
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].some(e => e.nom === nom && e.prenom === prenom)) {
        groupeNumber = i + 1;
        break;
      }
    }

    row.children[0].textContent = groupeNumber;
  });
}

// --- Gestion accès Prof ---

profPinSubmit.addEventListener('click', () => {
  if (profPinInput.value === PROF_CODE) {
    profAccessSection.style.display = 'none';
    profDashboard.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
  } else {
    alert('Code Prof incorrect.');
  }
});

logoutBtn.addEventListener('click', () => {
  profAccessSection.style.display = 'block';
  profDashboard.style.display = 'none';
  logoutBtn.style.display = 'none';
  profPinInput.value = '';
});

// --- Event listeners Élèves ---

startBtn.addEventListener('click', startChrono);
lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', resetAll);

etatBtns.forEach(btn => {
  btn.addEventListener('click', handleEtatClick);
});

// --- Event listeners Prof ---

exportCsvBtn.addEventListener('click', exportCSV);
generateGroupsBtn.addEventListener('click', generateGroups);
stopScanBtn.addEventListener('click', stopQRScanner);

// Au clic sur "Entrer" dans la section prof, on lance scanner
profPinSubmit.addEventListener('click', () => {
  if (profPinInput.value === PROF_CODE) {
    startQRScanner();
  }
});

// --- Initialisation ---

resetAll();
