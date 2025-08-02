// summary.js

document.addEventListener("DOMContentLoaded", () => {
  const eleve1Data = JSON.parse(localStorage.getItem("eleve1Data"));
  const eleve2Data = JSON.parse(localStorage.getItem("eleve2Data"));

  const bilanContainer = document.getElementById("bilan-eleves");

  function createEleveSummary(eleveData, label) {
    if (!eleveData) return null;

    const div = document.createElement("div");
    div.classList.add("eleve-summary");

    div.innerHTML = `
      <h4>${label} : ${eleveData.prenom} ${eleveData.nom}</h4>
      <p><strong>Classe :</strong> ${eleveData.classe}</p>
      <p><strong>Sexe :</strong> ${eleveData.sexe}</p>
      <p><strong>Distance réalisée :</strong> ${eleveData.distance.toFixed(2)} m</p>
      <p><strong>Durée :</strong> ${eleveData.duree} s</p>
      <p><strong>Vitesse moyenne :</strong> ${eleveData.vitesse.toFixed(2)} m/s</p>
      <p><strong>VMA estimée :</strong> ${eleveData.vma.toFixed(2)} km/h</p>
    `;

    return div;
  }

  const eleve1Summary = createEleveSummary(eleve1Data, "Élève 1");
  const eleve2Summary = createEleveSummary(eleve2Data, "Élève 2");

  if (eleve1Summary) bilanContainer.appendChild(eleve1Summary);
  if (eleve2Summary) bilanContainer.appendChild(eleve2Summary);

  // Gestion du téléchargement CSV
  document.getElementById("downloadCSV").addEventListener("click", () => {
    const data = [eleve1Data, eleve2Data].filter(Boolean);
    if (data.length === 0) {
      alert("Aucune donnée disponible pour générer le CSV.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nom,Prénom,Classe,Sexe,Distance réalisée (m),Durée (s),Vitesse moyenne (m/s),VMA estimée (km/h)\n";

    data.forEach((e) => {
      csvContent += `${e.nom},${e.prenom},${e.classe},${e.sexe},${e.distance.toFixed(2)},${e.duree},${e.vitesse.toFixed(2)},${e.vma.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bilan_courses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Gestion du QR Code
  document.getElementById("downloadQR").addEventListener("click", () => {
    const data = [eleve1Data, eleve2Data].filter(Boolean);
    if (data.length === 0) {
      alert("Aucune donnée disponible pour générer le QR code.");
      return;
    }

    // Préparer les données au format JSON pour le QR code
    const qrData = JSON.stringify(data);

    // Utiliser une API externe gratuite pour générer un QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const qrContainer = document.getElementById("qrCodeContainer");
    qrContainer.innerHTML = ""; // reset

    const img = document.createElement("img");
    img.src = qrCodeUrl;
    img.alt = "QR Code du bilan des courses";
    qrContainer.appendChild(img);
  });
});
