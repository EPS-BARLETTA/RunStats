// Récupération des éléments du DOM
const startBtn = document.getElementById('startCourseBtn');

const eleve1Inputs = {
  nom: document.getElementById('eleve1Nom'),
  prenom: document.getElementById('eleve1Prenom'),
  classe: document.getElementById('eleve1Classe'),
  sexe: document.getElementById('eleve1Sexe'),
  vma: document.getElementById('eleve1Vma'),
  duree: document.getElementById('courseDuration1'),
  distance: document.getElementById('courseDistance1')
};

const eleve2Inputs = {
  nom: document.getElementById('eleve2Nom'),
  prenom: document.getElementById('eleve2Prenom'),
  classe: document.getElementById('eleve2Classe'),
  sexe: document.getElementById('eleve2Sexe'),
  vma: document.getElementById('eleve2Vma'),
  duree: document.getElementById('courseDuration2'),
  distance: document.getElementById('courseDistance2')
};

// Fonction pour valider les champs requis
function validateInputs() {
  // Vérifier nom, prenom, classe, sexe, durée et distance pour eleve1 et eleve2
  for (const eleve of [eleve1Inputs, eleve2Inputs]) {
    if (!eleve.nom.value.trim() ||
        !eleve.prenom.value.trim() ||
        !eleve.classe.value.trim() ||
        !eleve.sexe.value) {
      alert("Merci de renseigner le nom, prénom, classe et sexe des deux élèves.");
      return false;
    }
    if (!eleve.duree.value || isNaN(eleve.duree.value) || eleve.duree.value <= 0) {
      alert("Merci de renseigner une durée valide (en minutes).");
      return false;
    }
    if (!eleve.distance.value || isNaN(eleve.distance.value) || eleve.distance.value <= 0) {
      alert("Merci de renseigner une distance valide (en mètres).");
      return false;
    }
  }
  return true;
}

// Fonction au clic sur démarrer la course (pour élève 1 d'abord)
startBtn.addEventListener('click', () => {
  if (!validateInputs()) return;

  // Préparer les données à envoyer vers la page course.html
  // on envoie par URL via query parameters JSON stringifié et encodé
  const courseData = {
    eleve1: {
      nom: eleve1Inputs.nom.value.trim(),
      prenom: eleve1Inputs.prenom.value.trim(),
      classe: eleve1Inputs.classe.value.trim(),
      sexe: eleve1Inputs.sexe.value,
      vma: eleve1Inputs.vma.value ? parseFloat(eleve1Inputs.vma.value) : null,
      duree: parseFloat(eleve1Inputs.duree.value),
      distance: parseFloat(eleve1Inputs.distance.value)
    },
    eleve2: {
      nom: eleve2Inputs.nom.value.trim(),
      prenom: eleve2Inputs.prenom.value.trim(),
      classe: eleve2Inputs.classe.value.trim(),
      sexe: eleve2Inputs.sexe.value,
      vma: eleve2Inputs.vma.value ? parseFloat(eleve2Inputs.vma.value) : null,
      duree: parseFloat(eleve2Inputs.duree.value),
      distance: parseFloat(eleve2Inputs.distance.value)
    }
  };

  // Passer les données vers course.html en les encodant en base64
  // pour éviter problème avec caractères spéciaux dans URL
  const dataStr = btoa(JSON.stringify(courseData));

  // Ouvrir course.html avec data dans query param 'data'
  window.location.href = `course.html?data=${dataStr}&eleve=1`;
});
