document.addEventListener('DOMContentLoaded', () => {
  const dataC1 = JSON.parse(sessionStorage.getItem('dataC1'));
  const dataC2 = JSON.parse(sessionStorage.getItem('dataC2'));

  if (!dataC1 || !dataC2) {
    document.body.innerHTML = "<p style='text-align:center; color:red;'>Aucune donnée disponible. Veuillez relancer une course.</p>";
    return;
  }

  const zone = document.getElementById('resume');
  zone.innerHTML = `
    <h2>Résultats</h2>
    <div class="result-wrapper">
      <div class="result-box">
        <h3>${dataC1.prenom} ${dataC1.nom}</h3>
        <p>Distance : ${dataC1.distance} m</p>
        <p>Vitesse : ${dataC1.vitesse} km/h</p>
        <p>VMA estimée : ${dataC1.vma} km/h</p>
      </div>
      <div class="result-box">
        <h3>${dataC2.prenom} ${dataC2.nom}</h3>
        <p>Distance : ${dataC2.distance} m</p>
        <p>Vitesse : ${dataC2.vitesse} km/h</p>
        <p>VMA estimée : ${dataC2.vma} km/h</p>
      </div>
    </div>
    <div id="qrCode"></div>
    <button id="downloadCSV">Télécharger les données (.csv)</button>
  `;

  // QR Code
  const qrData = [dataC1, dataC2];
  new QRCode(document.getElementById("qrCode"), {
    text: JSON.stringify(qrData),
    width: 200,
    height: 200
  });

  // CSV
  document.getElementById('downloadCSV').addEventListener('click', () => {
    let csv = "Nom,Prénom,Classe,Sexe,Distance,Vitesse,VMA\n";
    [dataC1, dataC2].forEach(p => {
      csv += `${p.nom},${p.prenom},${p.classe},${p.sexe},${p.distance},${p.vitesse},${p.vma}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "course.csv";
    link.click();
  });
});
