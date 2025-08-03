window.onload = function () {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  const stats = JSON.parse(sessionStorage.getItem("stats"));

  if (!eleve1 || !eleve2 || !stats) {
    document.getElementById("results").innerHTML = "<p>Données indisponibles. Veuillez relancer une course.</p>";
    return;
  }

  const results = [stats[0], stats[1]];
  const container = document.getElementById("results");

  results.forEach((result, index) => {
    const box = document.createElement("div");
    box.className = "eleve-box";

    box.innerHTML = `
      <h3>${result.nom} ${result.prenom}</h3>
      <p><strong>Classe :</strong> ${result.classe}</p>
      <p><strong>Sexe :</strong> ${result.sexe}</p>
      <p><strong>Distance :</strong> ${result.distance} m</p>
      <p><strong>Vitesse :</strong> ${result.vitesse.toFixed(2)} km/h</p>
      <p><strong>Estimation VMA :</strong> ${result.vma.toFixed(2)} km/h</p>
    `;

    container.appendChild(box);
  });

  // QR Code
  const qrData = results.map(e => `${e.nom} ${e.prenom} - ${e.vitesse.toFixed(1)} km/h - ${e.distance} m`).join('\n');
  QRCode.toCanvas(document.createElement('canvas'), qrData, { width: 200 }, (err, canvas) => {
    if (!err) document.getElementById("qrcode").appendChild(canvas);
  });

  // CSV
  document.getElementById("downloadCSV").addEventListener("click", function () {
    const csvRows = [
      "Nom,Prénom,Classe,Sexe,Distance (m),Vitesse (km/h),VMA estimée (km/h)",
      ...results.map(e =>
        `${e.nom},${e.prenom},${e.classe},${e.sexe},${e.distance},${e.vitesse.toFixed(2)},${e.vma.toFixed(2)}`
      )
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "runstats_donnees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
