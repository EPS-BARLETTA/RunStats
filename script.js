let tours = 0;
let chronoInterval;
let tempsRestant;
let distance = 0;
let resultats = [];

function startChrono() {
  const nom = document.getElementById("nomEleve").value.trim();
  const temps = parseFloat(document.getElementById("tempsCourse").value);
  distance = parseFloat(document.getElementById("distanceTour").value);
  const vmaInput = parseFloat(document.getElementById("vmaEleve").value);

  if (!nom || isNaN(temps) || isNaN(distance) || temps <= 0 || distance <= 0) {
    alert("Merci de remplir correctement tous les champs obligatoires.");
    return;
  }

  tours = 0;
  document.getElementById("nbTours").textContent = "0";
  document.getElementById("resumeFinal").innerHTML = "";
  document.getElementById("boutonsFinaux").style.display = "none";

  tempsRestant = temps * 60;
  updateChronoDisplay();
  document.getElementById("chronoSection").style.display = "block";

  chronoInterval = setInterval(() => {
    tempsRestant--;
    updateChronoDisplay();
    if (tempsRestant <= 0) {
      clearInterval(chronoInterval);
      afficherResumeFinal(nom, temps * 60);
    }
  }, 1000);
}

function updateChronoDisplay() {
  const minutes = Math.floor(tempsRestant / 60);
  const secondes = tempsRestant % 60;
  document.getElementById("chrono").textContent =
    String(minutes).padStart(2, "0") + ":" + String(secondes).padStart(2, "0");
}

function ajouterTour() {
  tours++;
  document.getElementById("nbTours").textContent = tours;
}

function afficherResumeFinal(nom, tempsTotalSec) {
  const distanceFinale = tours * distance;
  const vitesseKmh = ((distanceFinale / 1000) / (tempsTotalSec / 3600)).toFixed(2);

  const vmaInput = parseFloat(document.getElementById("vmaEleve").value);
  let intensiteTexte = "";
  let vmaAffichee = "";

  if (!isNaN(vmaInput) && vmaInput > 0) {
    const intensite = ((vitesseKmh / vmaInput) * 100).toFixed(0);
    intensiteTexte = `<p>Intensité : <strong>${intensite}%</strong> de la VMA (${vmaInput} km/h)</p>`;
    vmaAffichee = vmaInput.toFixed(2);
  }

  document.getElementById("resumeFinal").innerHTML = `
    <h3>Résumé de course</h3>
    <p>Élève observé : <strong>${nom}</strong></p>
    <p>Distance totale : ${distanceFinale} m</p>
    <p>Vitesse moyenne : ${vitesseKmh} km/h</p>
    ${intensiteTexte}
  `;

  document.getElementById("boutonsFinaux").style.display = "flex";

  resultats.push({
    date: new Date().toLocaleString('fr-FR'),
    nom: nom,
    tours: tours,
    distance: distanceFinale,
    vitesse: vitesseKmh,
    vma: vmaAffichee
  });
}

function reset() {
  document.getElementById("chronoSection").style.display = "none";
  document.getElementById("nomEleve").value = "";
  document.getElementById("tempsCourse").value = "";
  document.getElementById("distanceTour").value = "";
  document.getElementById("vmaEleve").value = "";
  document.getElementById("resumeFinal").innerHTML = "";
  document.getElementById("boutonsFinaux").style.display = "none";
}

function telechargerTous() {
  if (resultats.length === 0) {
    alert("Aucun résultat à télécharger.");
    return;
  }

  const headers = ["Date", "Élève", "Tours", "Distance_m", "Vitesse_kmh", "VMA_kmh"];
  const lignes = resultats.map(r => [r.date, r.nom, r.tours, r.distance, r.vitesse, r.vma || ""]);

  let csv = headers.join(",") + "\n";
  lignes.forEach(ligne => {
    csv += ligne.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_RunStats.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function viderResultats() {
  if (confirm("Effacer tous les résultats enregistrés ?")) {
    resultats = [];
    alert("Session vidée.");
  }
}
