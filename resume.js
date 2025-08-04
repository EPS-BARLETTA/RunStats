window.onload = function () {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  const stats = JSON.parse(sessionStorage.getItem("stats"));
  const duree = parseFloat(sessionStorage.getItem("dureeCourse"));

  const resultsDiv = document.getElementById("results");

  if (!eleve1 || !eleve2 || !stats || stats.length < 2) {
    resultsDiv.innerHTML = "<p>Aucune donnée disponible. Veuillez relancer une course.</p>";
    return;
  }

  const displayResult = (eleve) => {
    const distance = eleve.distance;
    const vitesse = (distance / 1000) / (duree / 60);
    const vma = vitesse * 1.15;

    eleve.vitesse = parseFloat(vitesse.toFixed(2));
    eleve.vma = parseFloat(vma.toFixed(2));

    return `
      <div class="eleve-box">
        <h3>${eleve.nom} ${eleve.prenom}</h3>
        <p><strong>Classe :</strong> ${eleve.classe}</p>
        <p><strong>Sexe :</strong> ${eleve.sexe}</p>
        <p><strong>Distance :</strong> ${distance} m</p>
        <p><strong>Vitesse :</strong> ${eleve.vitesse} km/h</p>
        <p><strong>VMA estimée :</strong> ${eleve.vma} km/h</p>
      </div>
    `;
  };

  resultsDiv.innerHTML = stats.map(displayResult).join("");

  // ✅ QR code JSON compatible avec ScanProf
  const qrData = JSON.stringify(stats);

  QRCode.toCanvas(document.createElement("canvas"), qrData, { width: 200 }, (err, canvas) => {
    if (!err) document.getElementById("qrcode").appendChild(canvas);
  });

  // ✅ Télécharger CSV
  document.getElementById("downloadCSV").addEventListener("click", () => {
    const headers = ["Nom", "Prénom", "Classe", "Sexe", "Distance (m)", "Vitesse (km/h)", "VMA (km/h)"];
    const rows = stats.map(e =>
      [e.nom, e.prenom, e.classe, e.sexe, e.distance, e.vitesse.toFixed(2), e.vma.toFixed(2)]
    );
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "donnees_runstats.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
