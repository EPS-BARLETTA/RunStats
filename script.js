document.getElementById("perfForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const distance = parseFloat(document.getElementById("distance").value);
  const tours = parseInt(document.getElementById("tours").value);
  const temps = parseFloat(document.getElementById("temps").value);

  const distanceTotale = distance * tours; // en mètres
  const distanceKm = (distanceTotale / 1000).toFixed(2); // en km
  const vitesseMps = (distanceTotale / temps).toFixed(2); // m/s
  const vitesseKmh = ((distanceTotale / 1000) / (temps / 3600)).toFixed(2); // km/h

  const resultats = `
    <p><strong>Distance totale :</strong> ${distanceTotale} m (${distanceKm} km)</p>
    <p><strong>Vitesse moyenne :</strong> ${vitesseMps} m/s (${vitesseKmh} km/h)</p>
  `;

  document.getElementById("resultats").innerHTML = resultats;
});
