// eleve.js

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startEleve1');

  startBtn.addEventListener('click', () => {
    // Récupérer données élève 1
    const eleve1 = {
      nom: document.getElementById('eleve1Nom').value.trim(),
      prenom: document.getElementById('eleve1Prenom').value.trim(),
      classe: document.getElementById('eleve1Classe').value.trim(),
      sexe: document.getElementById('eleve1Sexe').value,
    };

    // Récupérer données élève 2
    const eleve2 = {
      nom: document.getElementById('eleve2Nom').value.trim(),
      prenom: document.getElementById('eleve2Prenom').value.trim(),
      classe: document.getElementById('eleve2Classe').value.trim(),
      sexe: document.getElementById('eleve2Sexe').value,
    };

    // Infos course
    const course = {
      duree: parseInt(document.getElementById('courseDuree').value),
      distance: parseFloat(document.getElementById('courseDistance').value),
      tours: parseInt(document.getElementById('courseTours').value),
      vma: document.getElementById('courseVma').value ? parseFloat(document.getElementById('courseVma').value) : null
    };

    // Validation simple
    if (!eleve1.prenom || !eleve1.nom || !eleve1.classe || eleve1.sexe === 'choisir') {
      alert("Veuillez remplir tous les champs de l'élève 1.");
      return;
    }
    if (!eleve2.prenom || !eleve2.nom || !eleve2.classe || eleve2.sexe === 'choisir') {
      alert("Veuillez remplir tous les champs de l'élève 2.");
      return;
    }
    if (isNaN(course.duree) || course.duree <= 0 || isNaN(course.distance) || course.distance <= 0 || isNaN(course.tours) || course.tours <= 0) {
      alert("Veuillez renseigner correctement la durée, la distance et le nombre de tours.");
      return;
    }

    // Stocker dans localStorage
    localStorage.setItem('eleve1', JSON.stringify(eleve1));
    localStorage.setItem('eleve2', JSON.stringify(eleve2));
    localStorage.setItem('course', JSON.stringify(course));
    localStorage.setItem('currentEleve', 'eleve1');
    localStorage.setItem('eleve1DistanceTotal', course.distance * course.tours);
    localStorage.setItem('eleve2DistanceTotal', 0);
    localStorage.setItem('eleve1Tours', course.tours);
    localStorage.setItem('eleve2Tours', 0);

    // Redirection vers la page de course (minuteur)
    window.location.href = "course.html";
  });
});
