let tours = 0;
let tempsRestant = 0;
let timer;
let codePIN = localStorage.getItem('pinProf') || "0000";
let sauvegardes = [];

document.getElementById("formCourse").addEventListener("submit", lancerCourse);

function lancerCourse(e) {
  e.preventDefault();
  tours = 0;

  const nom = document.getElementById("nom").value;
  const duree = parseInt(document.getElementById("duree").value) * 60;
  const distanceTour = parseFloat(document.getElementById("distance").value);
  const vmaRef = parseFloat(document.getElementById("vmaEleve").value);

  if (!nom || isNaN(duree) || isNaN(distanceTour)) return;

  tempsRestant = duree;
  const interfaceCourse = document.getElementById("interfaceCourse");
  interfaceCourse.innerHTML = `
    <h2>${nom}</h2>
    <p><strong>Temps restant :</strong> <span id="chrono">${formatTemps(tempsRestant)}</span></p>
    <button onclick="ajouterTour()">➕ Tour</button>
    <p><strong>Tours :</strong> <span id="nbTours">0</span></p>
    <p><strong>Distance totale :</strong> <span id="distanceTotale">0</span> m</p>
    <div id="finCourse" style="margin-top: 1rem;"></div>
  `;
  interfaceCourse.style.display = "block";

  timer = setInterval(() => {
    tempsRestant--;
    const chrono = document.getElementById("chrono");
    if (chrono) {
      chrono.innerText = formatTemps(tempsRestant);
      if (tempsRestant <= 10) {
        chrono.style.color = "red";
      }
    }
    if (tempsRestant <= 0) {
      clearInterval(timer);
      finDeCourse(nom, distanceTour, vmaRef);
    }
  }, 1000);
}

function ajouterTour() {
  tours++;
  const distanceTour = parseFloat(document.getElementById("distance").value);
  document.getElementById("nbTours").innerText = tours;
  document.getElementById("distanceTotale").innerText = tours * distanceTour;
}

function finDeCourse(nom, distanceTour, vmaRef) {
  const tempsMinutes = parseInt(document.getElementById("duree").value);
  const distance = tours * distanceTour;
  const vitesse = (distance / 1000) / (tempsMinutes / 60);
  const vmaEstimee = vitesse * 1.15;

  let comparaison = vmaRef
    ? `<p><strong>VMA Référence :</strong> ${vmaRef.toFixed(2)} km/h<br><strong>VMA Estimée :</strong> ${vmaEstimee.toFixed(2)} km/h</p>`
    : `<p><strong>VMA Estimée :</strong> ${vmaEstimee.toFixed(2)} km/h</p>`;

  const etatForme = `
    <p><strong>Comment tu te sens ?</strong></p>
    <button onclick="sauvegarderResultat('${nom}', ${distanceTour}, ${tempsMinutes}, ${vitesse.toFixed(2)}, ${vmaEstimee.toFixed(2)}, '🤢')">🤢</button>
    <button onclick="sauvegarderResultat('${nom}', ${distanceTour}, ${tempsMinutes}, ${vitesse.toFixed(2)}, ${vmaEstimee.toFixed(2)}, '😐')">😐</button>
    <button onclick="sauvegarderResultat('${nom}', ${distanceTour}, ${tempsMinutes}, ${vitesse.toFixed(2)}, ${vmaEstimee.toFixed(2)}, '😊')">😊</button>
  `;

  document.getElementById("finCourse").innerHTML = `
    <p><strong>Vitesse moyenne :</strong> ${vitesse.toFixed(2)} km/h</p>
    ${comparaison}
    ${etatForme}
  `;
}

function sauvegarderResultat(nom, distanceTour, dureeMin, vitesse, vma, etat) {
  const data = {
    nom,
    tours,
    distance: tours * distanceTour,
    duree: dureeMin,
    vitesse,
    vma,
    etat
  };
  sauvegardes.push(data);
  genererQRCode(data);
  alert("Résultat enregistré !");
}

function genererQRCode(data) {
  const zone = document.getElementById("finCourse");
  const json = encodeURIComponent(JSON.stringify(data));
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${json}`;
  zone.innerHTML += `<p><strong>QR Code à faire scanner :</strong></p><img src="${url}" alt="QR Code" />`;
}

function formatTemps(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// ----- Mode Professeur -----
function demanderCode() {
  const code = prompt("Code Professeur ?");
  if (code === codePIN) {
    interfaceProf();
  } else {
    alert("Code incorrect.");
  }
}

function interfaceProf() {
  const prof = document.getElementById("interfaceProf");
  prof.style.display = "block";
  let html = "<h3>Résultats sauvegardés</h3>";

  if (sauvegardes.length === 0) {
    html += "<p>Aucune donnée disponible.</p>";
  } else {
    sauvegardes.sort((a, b) => a.nom.localeCompare(b.nom));
    html += "<table border='1' cellpadding='5'><tr><th>Nom</th><th>Tours</th><th>Distance</th><th>Durée</th><th>Vitesse</th><th>VMA</th><th>État</th></tr>";
    sauvegardes.forEach(s => {
      html += `<tr><td>${s.nom}</td><td>${s.tours}</td><td>${s.distance} m</td><td>${s.duree} min</td><td>${s.vitesse} km/h</td><td>${s.vma} km/h</td><td>${s.etat}</td></tr>`;
    });
    html += "</table><br><button onclick='exportCSV()'>📤 Exporter CSV</button>";
  }

  html += `<br><br><button onclick="changerCode()">🔐 Changer le code PIN</button>`;
  document.getElementById("interfaceProf").innerHTML = html;
}

function exportCSV() {
  const lignes = [
    ["Nom", "Tours", "Distance (m)", "Durée (min)", "Vitesse (km/h)", "VMA (km/h)", "État"]
  ];
  sauvegardes.forEach(s => {
    lignes.push([s.nom, s.tours, s.distance, s.duree, s.vitesse, s.vma, s.etat]);
  });

  const contenu = lignes.map(l => l.join(";")).join("\\n");
  const blob = new Blob([contenu], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "runstats_export.csv";
  a.click();
}

function changerCode() {
  const nouveau = prompt("Nouveau code à 4 chiffres :");
  if (/^\\d{4}$/.test(nouveau)) {
    codePIN = nouveau;
    localStorage.setItem("pinProf", nouveau);
    alert("Code mis à jour !");
  } else {
    alert("Code invalide.");
  }
}
