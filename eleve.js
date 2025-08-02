document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("studentForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const eleve1 = {
      prenom: document.getElementById("prenom1").value.trim(),
      nom: document.getElementById("nom1").value.trim(),
      classe: document.getElementById("classe1").value.trim(),
      sexe: document.getElementById("sexe1").value,
      temps: parseFloat(document.getElementById("temps1").value),
      longueurTour: parseFloat(document.getElementById("longueur1").value),
      vma: parseFloat(document.getElementById("vma1").value) || null
    };

    const eleve2 = {
      prenom: document.getElementById("prenom2").value.trim(),
      nom: document.getElementById("nom2").value.trim(),
      classe: document.getElementById("classe2").value.trim(),
      sexe: document.getElementById("sexe2").value,
      temps: parseFloat(document.getElementById("temps2").value),
      longueurTour: parseFloat(document.getElementById("longueur2").value),
      vma: parseFloat(document.getElementById("vma2").value) || null
    };

    sessionStorage.setItem("eleve1Data", JSON.stringify(eleve1));
    sessionStorage.setItem("eleve2Data", JSON.stringify(eleve2));
    sessionStorage.setItem("currentEleve", "1");

    window.location.href = "course.html";
  });
});
