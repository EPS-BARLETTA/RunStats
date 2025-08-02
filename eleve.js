document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startCourseBtn");

  startBtn.addEventListener("click", () => {
    // Récupérer infos élève 1
    const eleve1 = {
      prenom: document.getElementById("prenom1").value.trim(),
      nom: document.getElementById("nom1").value.trim(),
      classe: document.getElementById("classe1").value.trim(),
      sexe: document.getElementById("sexe1").value,
      vma: document.getElementById("vma1").value.trim()
    };

    // Récupérer infos élève 2
    const eleve2 = {
      prenom: document.getElementById("prenom2").value.trim(),
      nom: document.getElementById("nom2").value.trim(),
      classe: document.getElementById("classe2").value.trim(),
      sexe: document.getElementById("sexe2").value,
      vma: document.getElementById("vma2").value.trim()
    };

    // Récupérer infos course
    const courseInfo = {
      duree: document.getElementById("duree").value.trim(),
      distanceTour: document.getElementById("distance").value.trim(),
      nbTours: document.getElementById("tours").value.trim()
    };

    // Vérification des champs obligatoires
    if (!eleve1.prenom || !eleve1.nom || !eleve2.prenom || !eleve2.nom || !courseInfo.duree || !courseInfo.distanceTour) {
      alert("Merci de remplir les champs obligatoires (Prénom, Nom, Durée et Distance).");
      return;
    }

    // Stockage dans localStorage
    localStorage.setItem("eleve1", JSON.stringify(eleve1));
    localStorage.setItem("eleve2", JSON.stringify(eleve2));
    localStorage.setItem("courseInfo", JSON.stringify(courseInfo));

    // Redirection vers course.html (pour élève 1)
    window.location.href = "course.html?eleve=1";
  });
});

