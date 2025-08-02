function loadData() {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  return [eleve1, eleve2];
}

function remplirTableau(data) {
  const tbody = document.getElementById("table-body");
  data.forEach(eleve => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eleve.nom}</td>
      <td>${eleve.prenom}</td>
      <td>${eleve.classe}</td>
      <td>${eleve.sexe}</td>
      <td>${eleve.distance}</td>
      <td>${eleve.vitesse.toFixed(2)}</td>
      <td>${eleve.vmaEstimee}</td>
      <td>${eleve.vma || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function genererCSV(data) {
  const enTete = "Nom,Prénom,Classe,Sexe,Distance (m),Vitesse (m/s),VMA estimée (km/h),VMA réelle";
  const lignes = data.map(e =>
    `${e.nom},${e.prenom},${e.classe},${e.sexe},${e.distance},${e.vitesse.toFixed(2)},${e.vmaEstimee},${e.vma || ""}`
  );
  return [enTete, ...lignes].join("\n");
}

function telechargerCSV(contenu) {
  const blob = new Blob([contenu], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_runstats.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function genererQR(data) {
  const qr = new QRious({
    element: document.getElementById("qr"),
    value: JSON.stringify(data),
    size: 250,
    background: "white",
    foreground: "black"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const data = loadData();
  remplirTableau(data);
  genererQR(data);

  document.getElementById("downloadCSV").addEventListener("click", () => {
    const csv = genererCSV(data);
    telechargerCSV(csv);
  });
});
