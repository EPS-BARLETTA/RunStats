window.onload = function () {
  const eleve1 = JSON.parse(sessionStorage.getItem("eleve1"));
  const eleve2 = JSON.parse(sessionStorage.getItem("eleve2"));
  const statsOriginal = JSON.parse(sessionStorage.getItem("stats")); // stats brutes (2 élèves)
  const duree = parseFloat(sessionStorage.getItem("dureeCourse"));   // minutes

  const resultsDiv = document.getElementById("results");
  const lapLengthInput = document.getElementById("lapLength");
  const fractionASelect = document.getElementById("fractionA");
  const fractionBSelect = document.getElementById("fractionB");

  if (!eleve1 || !eleve2 || !statsOriginal || statsOriginal.length < 2) {
    resultsDiv.innerHTML = "<p>Aucune donnée disponible. Veuillez relancer une course.</p>";
    return;
  }

  // Helpers
  function getLapLength() {
    const n = Number(lapLengthInput?.value || 400);
    return isNaN(n) || n <= 0 ? 400 : n;
  }
  function extraMetersFromFraction(selectEl) {
    const frac = Number(selectEl?.value || 0);
    const extra = getLapLength() * (isNaN(frac) ? 0 : frac);
    return Math.round(extra * 100) / 100;
  }
  function kmh(distanceMeters, dureeMinutes) {
    if (!dureeMinutes || isNaN(dureeMinutes) || dureeMinutes <= 0) return 0;
    return (distanceMeters / 1000) / (dureeMinutes / 60);
  }
  function round2(x){ return Math.round(x * 100) / 100; }

  // Applique les fractions et renvoie une copie ajustée des stats
  function computeAdjustedStats() {
    const extraA = extraMetersFromFraction(fractionASelect);
    const extraB = extraMetersFromFraction(fractionBSelect);

    // On clone pour ne pas modifier les stats originales
    const s0 = JSON.parse(JSON.stringify(statsOriginal));

    // Élève A = s0[0], Élève B = s0[1] (selon ton flux actuel)
    if (s0[0]) {
      const d = Number(s0[0].distance || 0) + extraA;
      s0[0].distance = round2(d);
      s0[0].vitesse = round2(kmh(d, duree)); // recalc km/h si durée dispo
    }
    if (s0[1]) {
      const d = Number(s0[1].distance || 0) + extraB;
      s0[1].distance = round2(d);
      s0[1].vitesse = round2(kmh(d, duree));
    }
    return s0;
  }

  function render() {
    const stats = computeAdjustedStats();

    // Affichage HTML
    const displayResult = (eleve) => {
      const distance = eleve.distance;
      const vitesse = eleve.vitesse;
      return `
        <div class="eleve">
          <p><strong>Nom :</strong> ${eleve.nom} ${eleve.prenom}</p>
          <p><strong>Classe :</strong> ${eleve.classe} | <strong>Sexe :</strong> ${eleve.sexe}</p>
          <p><strong>Distance :</strong> ${distance} m</p>
          <p><strong>Vitesse :</strong> ${isNaN(vitesse) ? "—" : vitesse.toFixed(2)} km/h</p>
          <p><strong>VMA estimée :</strong> ${eleve.vma} km/h</p>
        </div>
      `;
    };

    resultsDiv.innerHTML = stats.map(displayResult).join("");

    // QR code JSON compatible ScanProf (avec distances ajustées)
    const qrData = JSON.stringify(stats);
    const qrel = document.getElementById("qrcode");
    qrel.innerHTML = ""; // reset
    QRCode.toCanvas(document.createElement("canvas"), qrData, { width: 200 }, (err, canvas) => {
      if (!err) qrel.appendChild(canvas);
    });

    // Bouton CSV → exporte les valeurs ajustées
    const btnCsv = document.getElementById("downloadCSV");
    btnCsv.onclick = () => {
      const headers = ["Nom", "Prénom", "Classe", "Sexe", "Distance (m)", "Vitesse (km/h)", "VMA (km/h)"];
      const rows = stats.map(e =>
        [e.nom, e.prenom, e.classe, e.sexe, e.distance, isNaN(e.vitesse) ? "" : e.vitesse.toFixed(2), e.vma]
      );
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "donnees_runstats.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  // Initial render
  render();

  // Recalcule dès que l’utilisateur change la longueur de tour ou la fraction
  [lapLengthInput, fractionASelect, fractionBSelect].forEach(el => {
    el && el.addEventListener("change", render);
  });
};
