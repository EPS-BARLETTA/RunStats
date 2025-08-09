function afficherDonnees(eleve, prefix) {
  document.getElementById(`nom${prefix}`).textContent = `${eleve.prenom} ${eleve.nom}`;
  document.getElementById(`classe${prefix}`).textContent = eleve.classe;
  document.getElementById(`sexe${prefix}`).textContent = eleve.sexe;
  document.getElementById(`distance${prefix}`).textContent = eleve.distance;
  document.getElementById(`vitesse${prefix}`).textContent = eleve.vitesse.toFixed(2);
  document.getElementById(`vma${prefix}`).textContent = (eleve.vmaEstimee != null ? eleve.vmaEstimee : eleve.vma);
}

function genererCSV(eleve1, eleve2) {
  const lignes = [
    ["Prénom", "Nom", "Classe", "Sexe", "Distance", "Vitesse (m/s)", "VMA estimée (km/h)"],
    [eleve1.prenom, eleve1.nom, eleve1.classe, eleve1.sexe, eleve1.distance, eleve1.vitesse.toFixed(2), (eleve1.vmaEstimee != null ? eleve1.vmaEstimee : eleve1.vma)],
    [eleve2.prenom, eleve2.nom, eleve2.classe, eleve2.sexe, eleve2.distance, eleve2.vitesse.toFixed(2), (eleve2.vmaEstimee != null ? eleve2.vmaEstimee : eleve2.vma)]
  ];

  const contenu = lignes.map(l => l.join(";")).join("\n");
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const lien = document.createElement("a");
  lien.setAttribute("href", url);
  lien.setAttribute("download", "resultats_RunStats.csv");
  lien.click();
}

function genererQRCode(data) {
  const canvas = document.createElement("canvas");
  QRCode.toCanvas(canvas, JSON.stringify(data), { width: 200 }, function (error) {
    if (error) console.error(error);
    else {
      document.getElementById("qrcode").innerHTML = "";
      document.getElementById("qrcode").appendChild(canvas);
    }
  });
}

function telechargerQRCode() {
  const canvas = document.querySelector("#qrcode canvas");
  if (!canvas) {
    alert("QR code non généré.");
    return;
  }

  const lien = document.createElement("a");
  lien.href = canvas.toDataURL("image/png");
  lien.download = "RunStats_QRcode.png";
  lien.click();
}

document.addEventListener("DOMContentLoaded", () => {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));

  if (eleve1 && eleve2) {
    afficherDonnees(eleve1, "1");
    afficherDonnees(eleve2, "2");

    genererQRCode({ eleve1, eleve2 });

    document.getElementById("downloadCSV").addEventListener("click", () => {
      genererCSV(eleve1, eleve2);
    });

    document.getElementById("downloadQR").addEventListener("click", telechargerQRCode);
  } else {
    alert("Aucune donnée disponible. Veuillez relancer une course.");
  }
});
