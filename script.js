let tours = 0;
let tempsRestant = 0;
let interval;
let codeProf = "0000";
let donneesScannees = [];

document.getElementById("formCourse").addEventListener("submit", (e) => {
  e.preventDefault();
  lancerCourse();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  location.reload();
});

document.getElementById("btnModeProf").addEventListener("click", () => {
  let code = prompt("Entrez le code Prof :");
  if (code === codeProf) {
    document.getElementById("interfaceProf").style.display = "block";
  } else {
    alert("Code incorrect !");
  }
});

document.getElementById("scanBtn").addEventListener("click", () => {
  alert("Scanner un QR code avec la caméra (fonction à implémenter avec lib JS externe ou application de scan QR).");
  // Simulation : ajouter manuellement des données pour test
  let testData = prompt("Colle ici les données JSON du QR (test) :");
  if (testData) {
    try {
      let obj = JSON.parse(testData);
      donneesScannees.push(obj);
      majTableauProf();
    } catch {
      alert("QR invalide.");
    }
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  let lignes = ["Nom,Distance,Temps,Vitesse,VMA,État"];
  donneesScannees.forEach(d => {
    lignes.push(`${d.nom},${d.distance},${d.duree},${d.vitesse.toFixed(2)},${d.vma || ""},${d.etat || ""}`);
  });
  let blob = new Blob([lignes.join("\n")], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "RunStats_export.csv";
  a.click();
});

function lancerCourse() {
  const nom = document.getElementById("nom").value.trim();
  const duree = parseFloat(document.getElementById("duree").value);
  const distanceTour = parseFloat(document.getElementById("distance").value);
  const vmaRef = parseFloat(document.getElementById("vmaEleve").value);

  if (!nom || !duree || !distanceTour) return alert("Tous les champs obligatoires doivent être remplis.");

  tours = 0;
  tempsRestant = duree * 60;
  document.getElementById("formCourse").style.display = "none";

  const zone = document.getElementById("interfaceCourse");
  zone.innerHTML = `
    <h2>${nom}</h2>
    <p><strong>Temps restant :</strong> <span id="chrono">${formatTemps(tempsRestant)}</span></p>
    <button id="boutonTour">➕ Ajouter un tour</button>
    <p><strong>Tours effectués :</strong> <span id="nbTours">0</span></p>
    <p><strong>Distance totale :</strong> <span id="distanceTotal">0</span> m</p>
    <div id="qrCodeContainer"></div>
  `;
  zone.style.display = "block";

  document.getElementById("boutonTour").addEventListener("click", () => {
    tours++;
    document.getElementById("nbTours").textContent = tours;
    document.getElementById("distanceTotal").textContent = (tours * distanceTour).toFixed(2);
  });

  interval = setInterval(() => {
    tempsRestant--;
    const chrono = document.getElementById("chrono");
    chrono.textContent = formatTemps(tempsRestant);
    if (tempsRestant <= 10) {
      chrono.style.color = "red";
    }
    if (tempsRestant <= 0) {
      clearInterval(interval);
      finDeCourse(nom, duree, distanceTour, vmaRef);
    }
  }, 1000);
}

function formatTemps(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function finDeCourse(nom, duree, distanceTour, vmaRef) {
  const distanceTotale = tours * distanceTour;
  const vitesse = (distanceTotale / 1000) / (duree / 60); // km/h
  const vma = vitesse; // approximation

  const zone = document.getElementById("interfaceCourse");
  zone.innerHTML += `
    <p><strong>Vitesse moyenne :</strong> ${vitesse.toFixed(2)} km/h</p>
    <p><strong>VMA estimée :</strong> ${vma.toFixed(2)} km/h</p>
    ${vmaRef ? `<p><strong>Écart VMA :</strong> ${(vma - vmaRef).toFixed(2)} km/h</p>` : ''}
    <div>
      <p>Comment te sens-tu après la course ?</p>
      <button onclick="validerEtat('😊')">😊 Bien</button>
      <button onclick="validerEtat('😐')">😐 Bof</button>
      <button onclick="validerEtat('🤢')">🤢 Mal</button>
    </div>
  `;

  const qrData = {
    nom,
    tours,
    distance: distanceTotale,
    duree,
    vitesse,
    vma,
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
  document.getElementById("qrCodeContainer").innerHTML = `<img src="${qrUrl}" alt="QR Code" />`;

  // Stockage temporaire pour ajouter état ensuite
  window.resultatFinal = qrData;
}

function validerEtat(etatEmoji) {
  if (window.resultatFinal) {
    window.resultatFinal.etat = etatEmoji;
    alert("État enregistré dans le QR code !");
  }
}

// Trie et met à jour le tableau du prof
function majTableauProf() {
  const tbody = document.querySelector("#tableEleves tbody");
  tbody.innerHTML = "";

  donneesScannees.sort((a, b) => a.nom.localeCompare(b.nom));
  donneesScannees.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.nom}</td>
      <td>${d.distance}</td>
      <td>${d.duree}</td>
      <td>${d.vitesse.toFixed(2)}</td>
      <td>${d.vma?.toFixed(2) || ""}</td>
      <td>${d.etat || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}
