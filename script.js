let tours = 0;
let tempsRestant = 0;
let timer;
let codePIN = localStorage.getItem('pinProf') || "0000";
let sauvegardes = JSON.parse(localStorage.getItem('sauvegardesRunStats') || "[]");

const formCourse = document.getElementById("formCourse");
const interfaceCourse = document.getElementById("interfaceCourse");
const interfaceProf = document.getElementById("interfaceProf");
const btnModeProf = document.getElementById("btnModeProf");

formCourse.addEventListener("submit", lancerCourse);
btnModeProf.addEventListener("click", demanderCode);

function lancerCourse(e) {
  e.preventDefault();
  tours = 0;

  const nom = document.getElementById("nom").value.trim();
  const duree = Math.floor(parseFloat(document.getElementById("duree").value) * 60);
  const distanceTour = parseFloat(document.getElementById("distance").value);
  const vmaRef = parseFloat(document.getElementById("vmaEleve").value);

  if (!nom || isNaN(duree) || isNaN(distanceTour) || duree <= 0 || distanceTour <= 0) {
    alert("Merci de remplir correctement tous les champs obligatoires.");
    return;
  }

  tempsRestant = duree;
  formCourse.style.display = "none";
  interfaceProf.style.display = "none";
  interfaceCourse.style.display = "block";

  interfaceCourse.innerHTML = `
    <h2>${nom}</h2>
    <p><strong>Temps restant :</strong> <span id="chrono">${formatTemps(tempsRestant)}</span></p>
    <button id="btnTour">➕ Tour</button>
    <p><strong>Tours :</strong> <span id="nbTours">0</span></p>
    <p><strong>Distance totale :</strong> <span id="distanceTotale">0</span> m</p>
    <div id="finCourse"></div>
  `;

  document.getElementById("btnTour").addEventListener("click", ajouterTour);

  timer = setInterval(() => {
    tempsRestant--;
    const chrono = document.getElementById("chrono");
    if (tempsRestant <= 10) {
      chrono.classList.add("alerte");
    }
    if (chrono) chrono.textContent = formatTemps(tempsRestant);
    if (tempsRestant <= 0) {
      clearInterval(timer);
      finDeCourse(nom, distanceTour, vmaRef);
    }
  }, 1000);
}

function ajouterTour() {
  tours++;
  const distanceTour = parseFloat(document.getElementById("distance").value);
  document.getElementById("nbTours").textContent = tours;
  document.getElementById("distanceTotale").textContent = (tours * distanceTour).toFixed(2);
}

function finDeCourse(nom, distanceTour, vmaRef) {
  const dureeMin = parseFloat(document.getElementById("duree").value);
  const distance = tours * distanceTour;
  const vitesse = distance > 0 ? (distance / 1000) / (dureeMin / 60) : 0;
  const vmaEstimee = vitesse * 1.15;

  let comparaison = vmaRef && !isNaN(vmaRef)
    ? `<p><strong>VMA Référence :</strong> ${vmaRef.toFixed(2)} km/h<br><strong>VMA Estimée :</strong> ${vmaEstimee.toFixed(2)} km/h</p>`
    : `<p><strong>VMA Estimée :</strong> ${vmaEstimee.toFixed(2)} km/h</p>`;

  interfaceCourse.querySelector("#finCourse").innerHTML = `
    <p><strong>Vitesse moyenne :</strong> ${vitesse.toFixed(2)} km/h</p>
    ${comparaison}
    <p><strong>Comment tu te sens ?</strong></p>
    <button class="etatBtn" data-emoji="🤢" title="Mal">🤢</button>
    <button class="etatBtn" data-emoji="😐" title="Bof">😐</button>
    <button class="etatBtn" data-emoji="😊" title="Bien">😊</button>
  `;

  Array.from(document.querySelectorAll(".etatBtn")).forEach(btn => {
    btn.addEventListener("click", () => {
      sauvegarderResultat(nom, tours, distance, dureeMin, vitesse, vmaEstimee, btn.dataset.emoji);
    });
  });

  document.getElementById("btnTour").disabled = true;
}

function sauvegarderResultat(nom, tours, distance, duree, vitesse, vma, etat) {
  const data = { nom, tours, distance, duree, vitesse, vma, etat };
  sauvegardes.push(data);
  localStorage.setItem('sauvegardesRunStats', JSON.stringify(sauvegardes));
  genererQRCode(data);
  alert("Résultat enregistré !");
}

function genererQRCode(data) {
  const zone = document.getElementById("finCourse");
  const json = encodeURIComponent(JSON.stringify(data));
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${json}`;
  zone.innerHTML += `<p><strong>QR Code à faire scanner :</strong></p><img src="${url}" alt="QR Code" />`;
}

// Formatage mm:ss
function formatTemps(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ===== Mode Professeur =====

function demanderCode() {
  const code = prompt("Entrez le code PIN Professeur:");
  if (code === codePIN) {
    afficherInterfaceProf();
  } else {
    alert("Code incorrect !");
  }
}

function afficherInterfaceProf() {
  formCourse.style.display = "none";
  interfaceCourse.style.display = "none";
  interfaceProf.style.display = "block";

  let html = `<h3>Résultats sauvegardés</h3>`;
  if (sauvegardes.length === 0) {
    html += "<p>Aucune donnée disponible.</p>";
  } else {
    sauvegardes.sort((a, b) => a.nom.localeCompare(b.nom));
    html += `
      <table>
        <thead>
          <tr>
            <th>Nom</th><th>Tours</th><th>Distance (m)</th><th>Durée (min)</th><th>Vitesse (km/h)</th><th>VMA Estimée</th><th>État</th>
          </tr>
        </thead>
        <tbody>
          ${sauvegardes.map(d => `
            <tr>
              <td>${d.nom}</td>
              <td>${d.tours}</td>
              <td>${d.distance.toFixed(2)}</td>
              <td>${d.duree}</td>
              <td>${d.vitesse.toFixed(2)}</td>
              <td>${d.vma.toFixed(2)}</td>
              <td>${d.etat}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <button id="btnExportCSV">Exporter CSV</button>
      <button id="btnChangerCode">Changer code Prof</button>
    `;
  }

  interfaceProf.innerHTML = html;

  document.getElementById("btnExportCSV")?.addEventListener("click", exporterCSV);
  document.getElementById("btnChangerCode")?.addEventListener("click", changerCodeProf);
}

function exporterCSV() {
  const entetes = ["Nom", "Tours", "Distance (m)", "Durée (min)", "Vitesse (km/h)", "VMA Estimée", "État"];
  const lignes = sauvegardes.map(d => [
    d.nom, d.tours, d.distance.toFixed(2), d.duree, d.vitesse.toFixed(2), d.vma.toFixed(2), d.etat
  ]);
  let csvContent = "data:text/csv;charset=utf-8," 
    + entetes.join(";") + "\n"
    + lignes.map(e => e.join(";")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const lien = document.createElement("a");
  lien.setAttribute("href", encodedUri);
  lien.setAttribute("download", "RunStats_resultats.csv");
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
}

function changerCodeProf() {
  const nouveauCode = prompt("Entrez un nouveau code PIN à 4 chiffres:");
  if (nouveauCode && /^\d{4}$/.test(nouveauCode)) {
    codePIN = nouveauCode;
    localStorage.setItem('pinProf', codePIN);
    alert("Code PIN changé !");
  } else {
    alert("Code invalide. Le code doit contenir exactement 4 chiffres.");
  }
}
