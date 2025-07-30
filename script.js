let tours = 0, distance = 0, timer, secondesRestantes = 0;

function startChrono() {
  const nom = document.getElementById("nomEleve").value.trim() || "Inconnu";
  const min = parseInt(document.getElementById("tempsMinutes").value) || 0;
  const sec = parseInt(document.getElementById("tempsSecondes").value) || 0;
  const distanceInput = parseFloat(document.getElementById("distanceTour").value);

  if (min < 0 || sec < 0 || sec > 59 || distanceInput <= 0) {
    alert("Merci de saisir des valeurs valides.");
    return;
  }
  distance = distanceInput;
  secondesRestantes = min * 60 + sec;
  if (secondesRestantes <= 0) {
    alert("Le temps doit être supérieur à 0.");
    return;
  }

  document.getElementById("tourBtn").disabled = false;
  document.getElementById("affichageTemps").textContent = formatTemps(secondesRestantes);

  timer = setInterval(() => {
    secondesRestantes--;
    document.getElementById("affichageTemps").textContent = formatTemps(secondesRestantes);
    if (secondesRestantes <= 10) document.getElementById("chronoBloc").classList.add("red");
    if (secondesRestantes <= 0) {
      clearInterval(timer);
      document.getElementById("tourBtn").disabled = true;
      afficherResumeFinal(nom);
    }
  }, 1000);
}

function ajouterTour() {
  tours++;
  document.getElementById("nbTours").textContent = tours;
  document.getElementById("distanceTotale").textContent = tours * distance;
}

function resetApp() {
  clearInterval(timer);
  tours = distance = secondesRestantes = 0;
  ["affichageTemps", "nbTours", "distanceTotale", "resumeFinal"].forEach(id => {
    document.getElementById(id).textContent = id === "resumeFinal" ? "" : (id === "affichageTemps" ? "--:--" : "0");
  });
  ["tempsMinutes", "tempsSecondes", "distanceTour", "nomEleve"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("tourBtn").disabled = true;
  document.getElementById("chronoBloc").classList.remove("red");
  document.getElementById("boutonCSV").innerHTML = "";
}

function afficherResumeFinal(nom) {
  const distanceFinale = tours * distance;
  const totalSec = (parseInt(document.getElementById("tempsMinutes").value) || 0) * 60 +
                    (parseInt(document.getElementById("tempsSecondes").value) || 0);
  const vitesseMps = (distanceFinale / totalSec).toFixed(2);
  const vitesseKmh = ((distanceFinale / 1000) / (totalSec / 3600)).toFixed(2);

  document.getElementById("resumeFinal").innerHTML = `
    <h3>Résumé de course</h3>
    <p>Élève observé : <strong>${nom}</strong></p>
    <p>Distance totale : ${distanceFinale} m</p>
    <p>Vitesse moyenne : ${vitesseMps} m/s (${vitesseKmh} km/h)</p>
  `;

  creerBoutonCSV(nom, distanceFinale, vitesseKmh);
}

function formatTemps(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, '0')}`;
}

function creerBoutonCSV(nom, distanceFinale, vitesseKmh) {
  const date = new Date().toLocaleString('fr-FR');
  const header = ['Date', 'Élève', 'Tours', 'Distance_m', 'Vitesse_kmh'];
  const data = [date, nom, tours, distanceFinale, vitesseKmh];
  const csvContent = [header, data].map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resultat_${nom}_${Date.now()}.csv`;
  a.textContent = '📥 Télécharger les résultats';
  a.className = 'csv-btn';
  document.getElementById('boutonCSV').innerHTML = '';
  document.getElementById('boutonCSV').appendChild(a);
}
