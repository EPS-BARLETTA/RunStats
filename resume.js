document.addEventListener('DOMContentLoaded', () => {
  const d1 = JSON.parse(sessionStorage.getItem('dataC1'));
  const d2 = JSON.parse(sessionStorage.getItem('dataC2'));

  if (!d1 || !d2) {
    document.getElementById('resume').innerHTML = `<p style="color:red;">Aucune donnée disponible. Veuillez relancer une course.</p>`;
    return;
  }

  const container = document.getElementById('resume');
  container.innerHTML = `
    <h2>Résultats</h2>
    <div class="result-wrapper">
      <div class="result-box"><h3>${d1.prenom} ${d1.nom}</h3>
        <p>Distance : ${d1.distance} m</p>
        <p>Vitesse : ${d1.vitesse} km/h</p>
        <p>VMA estimée : ${d1.vmaEstimee} km/h</p>
      </div>
      <div class="result-box"><h3>${d2.prenom} ${d2.nom}</h3>
        <p>Distance : ${d2.distance} m</p>
        <p>Vitesse : ${d2.vitesse} km/h</p>
        <p>VMA estimée : ${d2.vmaEstimee} km/h</p>
      </div>
    </div>
    <div id="qrcode"></div>
    <button id="downloadCSV">Télécharger le CSV</button>
  `;

  new QRCode(document.getElementById('qrcode'), {
    text: JSON.stringify([d1, d2]),
    width: 180,
    height: 180
  });

  document.getElementById('downloadCSV').addEventListener('click', () => {
    let csv = "Nom,Prénom,Classe,Sexe,Distance,Vitesse,VMA estimée\n";
    [d1, d2].forEach(p => {
      csv += `${p.nom},${p.prenom},${p.classe},${p.sexe},${p.distance},${p.vitesse},${p.vmaEstimee}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resultats.csv';
    link.click();
  });
});
