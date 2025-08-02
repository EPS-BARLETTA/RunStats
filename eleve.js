
document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Élève 1
  const eleve1 = {
    prenom: document.getElementById("prenom1").value.trim(),
    nom: document.getElementById("nom1").value.trim(),
    classe: document.getElementById("classe1").value.trim(),
    sexe: document.getElementById("sexe1").value,
    temps: parseInt(document.getElementById("temps1").value),
    longueurTour: parseInt(document.getElementById("longueur1").value),
    vma: parseFloat(document.getElementById("vma1").value) || null
  };

  // Élève 2
  const eleve2 = {
    prenom: document.getElementById("prenom2").value.trim(),
    nom: document.getElementById("nom2").value.trim(),
    classe: document.getElementById("classe2").value.trim(),
    sexe: document.getElementById("sexe2").value,
    temps: parseInt(document.getElementById("temps2").value),
    longueurTour: parseInt(document.getElementById("longueur2").value),
    vma: parseFloat(document.getElementById("vma2").value) || null
  };

  // Validation simple
  const champs = Object.values(eleve1).concat(Object.values(eleve2));
  if (champs.includes("") || champs.includes(NaN)) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  // Stockage dans la session
  sessionStorage.setItem("eleve1", JSON.stringify(eleve1));
  sessionStorage.setItem("eleve2", JSON.stringify(eleve2));

  // Rediriger vers la page de course
  window.location.href = "course.html";
});
