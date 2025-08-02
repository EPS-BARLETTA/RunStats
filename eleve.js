// eleve.js

// Variables globales
let duree, distanceTour, vmaInput;
let tempsRestant = 0;
let timerInterval = null;
let tours = 0;
let currentCourse = 1; // 1 ou 2
let eleve1Data = { nom: '', prenom: '', classe: '', sexe: '' };
let eleve2Data = { nom: '', prenom: '', classe: '', sexe: '' };
let dataCourse1 = null;
let dataCourse2 = null;

const demarrerBtn = document.getElementById('demarrer');
const resetBtn = document.getElementById('reset');
const minuteurDisplay = document.getElementById('minuteur');
const plusTourBtn = document.getElementById('plusTour');
const exportCsvBtn = document.getElementById('exportCsv');
const genQRCodeBtn = document.getElementById('genQRCode');
const currentCoureurDisplay = document.getElementById('currentCoureurDisplay');
const distanceParcourueDisplay = document.getElementById('distanceParcourue');
const vitesseDisplay = document.getElementById('vitesse');
const vmaEstimeeDisplay = document.getElementById('vmaEstimee');
const nombreToursDisplay = document.getElementById('nombreTours');
const courseSection = document.getElementById('course-section');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const toursAdditionnelsContainer = document.getElementById('toursAdditionnelsContainer');

// Fonction pour formater secondes en mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Démarrer timer
function startTimer() {
  minuteurDisplay.style.color = 'black';
  tempsRestant = duree * 60;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    tempsRestant--;
    updateTimerDisplay();

    if (tempsRestant <= 10) {
      minuteurDisplay.style.color = 'red';
    }

    if (tempsRestant <= 0) {
      clearInterval(timerInterval);
      finCourse();
    }
  }, 1000);
}

// Mise à jour affichage timer
function updateTimerDisplay() {
  minuteurDisplay.textContent = formatTime(tempsRestant);
}

// Reset complet
function resetAll() {
  clearInterval(timerInterval);
  tempsRestant = 0;
  tours = 0;
  currentCourse = 1;
  eleve1Data = { nom: '', prenom: '', classe: '', sexe: '' };
  eleve2Data = { nom: '', prenom: '', classe: '', sexe: '' };
  dataCourse1 = null;
  dataCourse2 = null;

  // Reset inputs
  document.getElementById('nom1').value = '';
  document.getElementById('prenom1').value = '';
  document.getElementById('classe1').value = '';
  document.getElementById('sexe1').value = '';

  document.getElementById('nom2').value = '';
  document.getElementById('prenom2').value = '';
  document.getElementById('classe2').value = '';
  document.getElementById('sexe2').value = '';

  document.getElementById('duree').value = '';
  document.getElementById('distanceTour').value = '';
  document.getElementById('vma').value = '';

  // Reset affichages
  plusTourBtn.style.display = 'none';
  exportCsvBtn.style.display = 'none';
  genQRCodeBtn.style.display = 'none';
  courseSection.style.display = 'none';
  currentCoureurDisplay.textContent = '';
  minuteurDisplay.textContent = '';
  distanceParcourueDisplay.textContent = 'Distance parcourue: 0 m';
  vitesseDisplay.textContent = 'Vitesse: 0 km/h';
  vmaEstimeeDisplay.textContent = 'VMA estimée: 0 km/h';
  nombreToursDisplay.textContent = 'Nombre de tours: 0';
  qrCodeContainer.innerHTML = '';
  toursAdditionnelsContainer.innerHTML = '';

  demarrerBtn.textContent = 'Démarrer la course 1';
  demarrerBtn.style.display = 'inline-block';
}

// Calculs et affichages après chaque ajout tour
function updateCourseDetails() {
  const distanceParcourue = tours * distanceTour;
  const tempsEcoule = (duree * 60) - tempsRestant;

  // Vitesse moyenne = distance / temps en m/s puis converti en km/h
  const vitesse = tempsEcoule > 0 ? (distanceParcourue / tempsEcoule) * 3.6 : 0;

  // Estimation VMA = distance totale / temps total * 3.6, si VMA donnée on peut comparer
  const vmaEstimee = vitesse;

  distanceParcourueDisplay.textContent = `Distance parcourue: ${distanceParcourue} m`;
  vitesseDisplay.textContent = `Vitesse: ${vitesse.toFixed(2)} km/h`;
  vmaEstimeeDisplay.textContent = `VMA estimée: ${vmaEstimee.toFixed(2)} km/h`;
  nombreToursDisplay.textContent = `Nombre de tours: ${tours}`;
}

// Fin de course
function finCourse() {
  clearInterval(timerInterval);
  plusTourBtn.style.display = 'none';
  exportCsvBtn.style.display = 'inline-block';
  genQRCodeBtn.style.display = 'inline-block';

  // Enregistrer données dans la bonne course
  const eleve = currentCourse === 1 ? eleve1Data : eleve2Data;
  const dataCourse = {
    eleve,
    course: currentCourse,
    duree,
    distanceTour,
    vmaInput,
    tours,
    distanceParcourue: tours * distanceTour,
    vitesseMoyenne: ((tours * distanceTour) / (duree * 60)) * 3.6,
  };

  if (currentCourse === 1) dataCourse1 = dataCourse;
  else dataCourse2 = dataCourse;

  // Message de fin
  currentCoureurDisplay.textContent = `Course ${currentCourse} terminée pour ${eleve.prenom} ${eleve.nom}`;

  // Si c'était la course 1, on prépare la course 2
  if (currentCourse === 1) {
    demarrerBtn.textContent = 'Démarrer la course 2';
    demarrerBtn.style.display = 'inline-block';
    courseSection.style.display = 'none';
  } else {
    demarrerBtn.style.display = 'none';
    // On affiche résumé final complet
    afficherResumeFinal();
  }
}

// Afficher résumé final des 2 courses
function afficherResumeFinal() {
  // Créer un résumé simple avec les 2 courses
  let resumeHTML = '<h3>Résumé final des courses :</h3>';

  if (dataCourse1) {
    resumeHTML += `
      <div style="color:#007bff; margin-bottom:10px;">
        <strong>Course 1 - ${dataCourse1.eleve.prenom} ${dataCourse1.eleve.nom}</strong><br/>
        Tours: ${dataCourse1.tours}<br/>
        Distance: ${dataCourse1.distanceParcourue} m<br/>
        Vitesse Moyenne: ${dataCourse1.vitesseMoyenne.toFixed(2)} km/h<br/>
      </div>`;
  }

  if (dataCourse2) {
    resumeHTML += `
      <div style="color:#28a745;">
        <strong>Course 2 - ${dataCourse2.eleve.prenom} ${dataCourse2.eleve.nom}</strong><br/>
        Tours: ${dataCourse2.tours}<br/>
        Distance: ${dataCourse2.distanceParcourue} m<br/>
        Vitesse Moyenne: ${dataCourse2.vitesseMoyenne.toFixed(2)} km/h<br/>
      </div>`;
  }

  currentCoureurDisplay.innerHTML = resumeHTML;
  exportCsvBtn.style.display = 'inline-block';
  genQRCodeBtn.style.display = 'inline-block';
}

// Export CSV
function exportCSV() {
  // Construire le CSV avec les 2 courses si présentes
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Course,Nom,Prénom,Classe,Sexe,Durée(min),DistanceTour(m),Tours,DistanceTotale(m),VitesseMoyenne(km/h)\r\n';

  if (dataCourse1) {
    csvContent += `1,${dataCourse1.eleve.nom},${dataCourse1.eleve.prenom},${dataCourse1.eleve.classe},${dataCourse1.eleve.sexe},${dataCourse1.duree},${dataCourse1.distanceTour},${dataCourse1.tours},${dataCourse1.distanceParcourue},${dataCourse1.vitesseMoyenne.toFixed(2)}\r\n`;
  }
  if (dataCourse2) {
    csvContent += `2,${dataCourse2.eleve.nom},${dataCourse2.eleve.prenom},${dataCourse2.eleve.classe},${dataCourse2.eleve.sexe},${dataCourse2.duree},${dataCourse2.distanceTour},${dataCourse2.tours},${dataCourse2.distanceParcourue},${dataCourse2.vitesseMoyenne.toFixed(2)}\r\n`;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const filename = `runstats_${new Date().toISOString().slice(0,10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Génération QR Code
function genererQRCode() {
  qrCodeContainer.innerHTML = ''; // Reset
  const infoTxt = `
Course 1: ${dataCourse1 ? dataCourse1.tours : 'N/A'} tours, vitesse ${dataCourse1 ? dataCourse1.vitesseMoyenne.toFixed(2) : 'N/A'} km/h
Course 2: ${dataCourse2 ? dataCourse2.tours : 'N/A'} tours, vitesse ${dataCourse2 ? dataCourse2.vitesseMoyenne.toFixed(2) : 'N/A'} km/h
`;
  QRCode.toCanvas(qrCodeContainer, infoTxt, { width: 180 }, function (error) {
    if (error) console.error(error);
  });
}

// Event listeners
demarrerBtn.addEventListener('click', () => {
  // Récupérer données élèves selon course (évidemment on peut adapter si tu veux autre logique)
  if (currentCourse === 1) {
    eleve1Data.nom = document.getElementById('nom1').value.trim();
    eleve1Data.prenom = document.getElementById('prenom1').value.trim();
    eleve1Data.classe = document.getElementById('classe1').value.trim();
    eleve1Data.sexe = document.getElementById('sexe1').value;
  } else {
    eleve2Data.nom = document.getElementById('nom2').value.trim();
    eleve2Data.prenom = document.getElementById('prenom2').value.trim();
    eleve2Data.classe = document.getElementById('classe2').value.trim();
    eleve2Data.sexe = document.getElementById('sexe2').value;
  }

  // Récupérer paramètres course
  duree = Number(document.getElementById('duree').value);
  distanceTour = Number(document.getElementById('distanceTour').value);
  vmaInput = Number(document.getElementById('vma').value);

  // Validation simple
  if (!duree || !distanceTour) {
    alert('Veuillez saisir une durée et une distance de tour valides.');
    return;
  }

  // Reset données course
  tours = 0;
  qrCodeContainer.innerHTML = '';
  toursAdditionnelsContainer.innerHTML = '';
  exportCsvBtn.style.display = 'none';
  genQRCodeBtn.style.display = 'none';

  demarrerBtn.style.display = 'none';
  courseSection.style.display = 'block';
  plusTourBtn.style.display = 'inline-block';

  currentCoureurDisplay.textContent = `Course ${currentCourse} - Coureur : ${currentCourse === 1 ? eleve1Data.prenom + ' ' + eleve1Data.nom : eleve2Data.prenom + ' ' + eleve2Data.nom}`;

  // Démarrer le timer
  startTimer();

  // Initial update affichage
  updateCourseDetails();
});

// Bouton + tour
plusTourBtn.addEventListener('click', () => {
  tours++;
  updateCourseDetails();
});

// Export CSV
exportCsvBtn.addEventListener('click', () => {
  exportCSV();
});

// Générer QR Code
genQRCodeBtn.addEventListener('click', () => {
  genererQRCode();
});

// Reset complet
resetBtn.addEventListener('click', () => {
  if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ?')) {
    resetAll();
  }
});

// Au chargement on reset tout
resetAll();
