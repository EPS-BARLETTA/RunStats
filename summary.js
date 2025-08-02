function chargerResultats() {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  const contenu = document.getElementById("resumeContent");

  if (!eleve1 || !eleve2) {
    contenu.innerHTML = "<p>Données manquantes.</p>";
    return;
  }

  const data = [eleve1, eleve2];
  let text = "";

  data.forEach((e, i) => {
    text += `<h3>Élève ${i + 1}</h3>`;
    text += `<p>Nom : ${e.nom}</p>`;
    text += `<p>Prénom : ${e.prenom}</p>`;
    text += `<p>Classe : ${e.classe}</p>`;
    text += `<p>Sexe : ${e.sexe}</p>`;
    text += `<p>Distance : ${e.distance} m</p>`;
    text += `<p>Vitesse : ${e.vitesse.toFixed(2)} m/s</p>`;
    text += `<p>VMA estimée : ${e.vmaEstimee} km/h</p>`;
    if (e.vma) {
      text += `<p>VMA réelle : ${e.vma} km/h</p>`;
    }
  });

  contenu.innerHTML = text;

  const qrText = JSON.stringify(data);
  QRCode.toCanvas(document.getElementById("qrCode"), qrText, {
    width: 200,
    margin: 2,
    color: {
      dark: "#000",
      light: "#FFF"
    }
  });
}

function telechargerCSV() {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  if (!eleve1 || !eleve2) return;

  const lignes = [
    "Nom;Prénom;Classe;Sexe;Distance (m);Vitesse (m/s);VMA estimée (km/h);VMA réelle",
    `${eleve1.nom};${eleve1.prenom};${eleve1.classe};${eleve1.sexe};${eleve1.distance};${eleve1.vitesse.toFixed(2)};${eleve1.vmaEstimee};${eleve1.vma || ""}`,
    `${eleve2.nom};${eleve2.prenom};${eleve2.classe};${eleve2.sexe};${eleve2.distance};${eleve2.vitesse.toFixed(2)};${eleve2.vmaEstimee};${eleve2.vma || ""}`
  ];

  const blob = new Blob([lignes.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_runstats.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  chargerResultats();
  document.getElementById("downloadBtn").addEventListener("click", telechargerCSV);
});
