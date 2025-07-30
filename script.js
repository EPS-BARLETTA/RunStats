let tours = 0;
let distance = 0;
let timer;
let secondesRestantes = 0;

function startChrono() {
  const min = parseInt(document.getElementById("tempsMinutes").value) || 0;
  const sec = parseInt(document.getElementById("tempsSecondes").value) || 0;
  const distanceInput = parseFloat(document.getElementById("distanceTour").value);

  if (min < 0 || sec < 0 || sec > 59 || distanceInput <= 0) {
    alert("Merci de saisir des valeurs valides.");
    return;
  }

  distance = distanceInput;
  secondesRestantes = min * 60 + sec;

  if (secondesRestantes === 0) {
    alert("Le temps doit être supérieur à 0.");
    return;
  }

  document.getElementById("tourBtn").disabled = false;
  document.getElementById("affichageTemps").textContent = formatTemps(secondesRestantes);

  timer = setInterval(() => {
    secondesRestantes--;
    const chronoBloc = document.getElementById("chronoBloc");
    document.getElementById("affichageTemps").textContent = formatTemps(secondesRestantes);

    if (secondesRestantes <= 10) {
      chronoBloc.classList.add("red");
    }

    if (secondesRestantes <= 0) {
      clearInterval(timer);
      document.getElementById("tourBtn").disabled = true;
      afficherResumeFinal();
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
  tours = 0;
  distance = 0;
  secondesRestantes = 0;

  document.getElementById("tourBtn").disabled = true;
  document.getElementById("nbTours").textContent = "0";
  document.getElementById("distanceTotale").textContent = "0";
  document.getElementById("affichageTemps").textContent = "--:--";
  document.getElementById("resumeFinal").innerHTML = "";
  document.getElementById("tempsMinutes").value = "";
  document.getElementById("tempsSecondes").value = "";
  document.getElementById("distanceTour").value = "";
  document.getElementById("chronoBloc").classList.remove("red");
}

function afficherResumeFinal() {
  const distanceFinale = tours * distance;
  const totalMinutes = parseInt(document.getElementById("tempsMinutes").value) || 0;
  const totalSecondes = parseInt(document.getElementById("tempsSecondes").value) || 0;
  const tempsSec = totalMinutes * 60 + totalSecondes;

  const vitesseMps = (distanceFinale / tempsSec).toFixed(2);
  const vitesseKmh = ((distanceFinale / 1000) / (tempsSec / 3600)).toFixed(2);

  document.getElementById("resumeFinal").innerHTML = `
    <h3>Résumé de course</h3>
    <p>Distance totale : ${distanceFinale} m</p>
    <p>Vitesse moyenne : ${vitesseMps} m/s (${vitesseKmh} km/h)</p>
  `;
}

function formatTemps(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, '0')}`;
}
