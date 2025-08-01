document.addEventListener("DOMContentLoaded", () => {
  // Récupérer les résultats stockés
  const resultats1 = JSON.parse(localStorage.getItem("resultats1"));
  const resultats2 = JSON.parse(localStorage.getItem("resultats2"));

  // Afficher dans la page
  const resultatsContainer = document.getElementById("resultatsContainer");

  function formatResultats(eleve, num) {
    return `
      <div class="resultat-card">
        <h4>Élève ${num}: ${eleve.prenom} ${eleve.nom}</h4>
        <p>Classe : ${eleve.classe}</p>
        <p>Sexe : ${eleve.sexe}</p>
        <p>Distance : ${eleve.distance} m</p>
        <p>Vitesse moyenne : ${eleve.vitesse}</p>
        <p>Estimation VMA : ${eleve.vmaEstimee}</p>
      </div>
    `;
  }

  resultatsContainer.innerHTML = `
    ${formatResultats(resultats1, 1)}
    ${formatResultats(resultats2, 2)}
  `;

  // Générer QR code
  const qrData = `Résultats:
Élève 1: ${resultats1.prenom} ${resultats1.nom}, ${resultats1.distance}m, ${resultats1.vitesse}, VMA ${resultats1.vmaEstimee}
Élève 2: ${resultats2.prenom} ${resultats2.nom}, ${resultats2.distance}m, ${resultats2.vitesse}, VMA ${resultats2.vmaEstimee}`;

  const qrContainer = document.getElementById("qrcode");
  const qrcode = new QRCode(qrContainer, {
    text: qrData,
    width: 200,
    height: 200,
  });

  // Télécharger QR code en image
  document.getElementById("downloadQrBtn").addEventListener("click", () => {
    const canvas = qrContainer.querySelector("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "resultats_qrcode.png";
    link.click();
  });

  // Télécharger CSV
  document.getElementById("downloadCsvBtn").addEventListener("click", () => {
    const csvContent = [
      ["Nom", "Prénom", "Classe", "Sexe", "Distance (m)", "Vitesse moyenne", "Estimation VMA"],
      [resultats1.nom, resultats1.prenom, resultats1.classe, resultats1.sexe, resultats1.distance, resultats1.vitesse, resultats1.vmaEstimee],
      [resultats2.nom, resultats2.prenom, resultats2.classe, resultats2.sexe, resultats2.distance, resultats2.vitesse, resultats2.vmaEstimee]
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resultats.csv";
    link.click();
  });
});
