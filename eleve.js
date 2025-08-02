document.getElementById('startCourseBtn').addEventListener('click', () => {
  // Récupération des données élève 1
  const prenom1 = document.getElementById('prenom1').value.trim();
  const nom1 = document.getElementById('nom1').value.trim();
  const classe1 = document.getElementById('classe1').value.trim();
  const sexe1 = document.getElementById('sexe1').value;

  // Récupération des données élève 2
  const prenom2 = document.getElementById('prenom2').value.trim();
  const nom2 = document.getElementById('nom2').value.trim();
  const classe2 = document.getElementById('classe2').value.trim();
  const sexe2 = document.getElementById('sexe2').value;

  // Course info
  const duree = Number(document.getElementById('duree').value);
  const distanceTour = Number(document.getElementById('distanceTour').value);
  const vma = Number(document.getElementById('vma').value) || null;

  // Validation simple
  if (!prenom1 || !nom1 || !classe1 || !sexe1) {
    alert("Merci de remplir tous les champs de l'élève 1.");
    return;
  }
  if (!prenom2 || !nom2 || !classe2 || !sexe2) {
    alert("Merci de remplir tous les champs de l'élève 2.");
    return;
  }
  if (!duree || duree <= 0) {
    alert("Merci de renseigner une durée valide (>0).");
    return;
  }
  if (!distanceTour || distanceTour <= 0) {
    alert("Merci de renseigner une distance de tour valide (>0).");
    return;
  }

  // Préparer données pour la page course.html
  const courseData = {
    eleve1: { prenom: prenom1, nom: nom1, classe: classe1, sexe: sexe1 },
    eleve2: { prenom: prenom2, nom: nom2, classe: classe2, sexe: sexe2 },
    duree, // en minutes
    distanceTour,
    vma,
  };

  // Stocker dans sessionStorage pour récupérer sur la page course.html
  sessionStorage.setItem('courseData', JSON.stringify(courseData));

  // Redirection vers course.html pour démarrer la course élève 1
  window.location.href = 'course.html?eleve=1';
});
