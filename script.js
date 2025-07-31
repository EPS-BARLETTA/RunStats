let timer;
let time = 0;
let duree = 0;
let laps = 0;
let courseTerminee = false;

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const distanceTotal = document.getElementById("distanceTotal");
const distanceKm = document.getElementById("distanceKm");
const vitesseMoy = document.getElementById("vitesseMoy");
const vmaReal = document.getElementById("vmaReal");
const etatForme = document.getElementById("etatForme");
const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

function formatTime(t) {
  const min = Math.floor(t / 60);
  const sec = t % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateChrono() {
  chronoDisplay.textContent = formatTime(time);

  if (duree * 60 - time <= 10 && !chronoDisplay.classList.contains("red")) {
    chronoDisplay.classList.add("warning");
  }

  if (time >= duree * 60) {
    clearInterval(timer);
    chronoDisplay.classList.remove("warning");
    chronoDisplay.classList.add("red");
    lapBtn.disabled = true;
    courseTerminee = true;
    etatForme.style.display = "block";
  }
}

function updateStats() {
  const tour = parseFloat(document.getElementById("distanceTour").value);
  const distance = laps * tour;
  const km = distance / 1000;
  const dureeHeures = time / 3600;
  const vitesse = dureeHeures > 0 ? km / dureeHeures : 0;

  distanceTotal.textContent = distance.toFixed(0);
  distanceKm.textContent = km.toFixed(2);
  vitesseMoy.textContent = vitesse.toFixed(2);
  vmaReal.textContent = vitesse.toFixed(2);
}

startBtn.addEventListener("click", () => {
  duree = parseFloat(document.getElementById("duree").value);
  const tour = parseFloat(document.getElementById("distanceTour").value);
  if (!duree || !tour) {
    alert("Merci de saisir une durée et une distance de tour.");
    return;
  }

  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  time = 0;
  laps = 0;
  courseTerminee = false;
  updateChrono();
  updateStats();
  chronoDisplay.classList.remove("red", "warning");

  timer = setInterval(() => {
    time++;
    updateChrono();
    updateStats();
  }, 1000);
});

lapBtn.addEventListener("click", () => {
  if (!courseTerminee) {
    laps++;
    updateStats();
    lapsCount.textContent = laps;
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  time = 0;
  laps = 0;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  chronoDisplay.classList.remove("red", "warning");
  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";
  lapsCount.textContent = 0;
  updateStats();
});

document.querySelectorAll(".etatBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const etat = btn.dataset.etat;

    const nom1 = document.getElementById("nom1").value.trim();
    const prenom1 = document.getElementById("prenom1").value.trim();
    const classe1 = document.getElementById("classe1").value.trim();

    if (!nom1 || !prenom1 || !classe1) {
      alert("Merci de remplir les informations de l'élève.");
      return;
    }

    const data = {
      nom: nom1,
      prenom: prenom1,
      classe: classe1,
      duree: formatTime(time),
      tours: laps,
      distance: parseFloat(document.getElementById("distanceTotal").textContent),
      vitesse: parseFloat(vitesseMoy.textContent),
      vma: parseFloat(vmaReal.textContent),
      etat: etat,
      timestamp: new Date().toISOString()
    };

    const text = JSON.stringify(data);
    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: text,
      width: 200,
      height: 200
    });

    etatForme.style.display = "none";
    qrContainer.style.display = "block";
  });
});

// === PARTIE PROF ===

const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const profDashboard = document.getElementById("profDashboard");
const qrReader = document.getElementById("qr-reader");
const stopScanBtn = document.getElementById("stopScanBtn");
const resultsBody = document.getElementById("resultsBody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

let profPin = "7890"; // code d’accès
let qrScanner;
let scannedData = []; // mémoire locale des élèves

profPinSubmit.addEventListener("click", () => {
  if (profPinInput.value === profPin) {
    profDashboard.style.display = "block";
    profPinInput.disabled = true;
    profPinSubmit.disabled = true;
    startScanner();
  } else {
    alert("Code incorrect !");
  }
});

function startScanner() {
  qrScanner = new Html5Qrcode("qr-reader");
  qrScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      try {
        const data = JSON.parse(decodedText);

        // Empêcher doublons
        if (scannedData.some(d => d.timestamp === data.timestamp)) return;

        scannedData.push(data);
        displayInTable(data);

      } catch (e) {
        console.error("Erreur parsing QR", e);
      }
    },
    (errorMsg) => {
      // silence les erreurs de scan
    }
  );
}

stopScanBtn.addEventListener("click", () => {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      qrReader.innerHTML = "";
    });
  }
});

function displayInTable(data) {
  const row = document.createElement("tr");

  const distance = data.tours * (data.distanceTour || 200); // valeur par défaut
  const vitesse = (distance / (parseFloat(data.duree.split(":")[0]) * 60 + parseFloat(data.duree.split(":")[1]))) * 3.6;

  row.innerHTML = `
    <td>${data.nom || data.eleve1 || "?"}</td>
    <td>${data.classe || "?"}</td>
    <td>${data.duree}</td>
    <td>${data.tours}</td>
    <td>${distance}</td>
    <td>${vitesse.toFixed(2)}</td>
    <td>${data.vma || "—"}</td>
    <td>${data.etat}</td>
  `;
  resultsBody.appendChild(row);
}

exportCsvBtn.addEventListener("click", () => {
  let csv = "Élève,Classe,Durée,Tours,Distance,Vitesse,VMA,État\n";

  scannedData.forEach(data => {
    const distance = data.tours * (data.distanceTour || 200);
    const vitesse = (distance / (parseFloat(data.duree.split(":")[0]) * 60 + parseFloat(data.duree.split(":")[1]))) * 3.6;

    csv += [
      data.nom || data.eleve1 || "?",
      data.classe || "?",
      data.duree,
      data.tours,
      distance,
      vitesse.toFixed(2),
      data.vma || "—",
      data.etat
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_runstats.csv";
  a.click();
  URL.revokeObjectURL(url);
});

const generateGroupsBtn = document.getElementById("generateGroupsBtn");
const groupsDisplay = document.getElementById("groupsDisplay");

generateGroupsBtn.addEventListener("click", () => {
  // 1. On filtre ceux qui ont une VMA valide
  const validVMA = scannedData
    .filter(d => parseFloat(d.vma))
    .map(d => ({
      nom: d.nom || d.eleve1 || "?",
      classe: d.classe || "?",
      vma: parseFloat(d.vma),
      data: d
    }));

  if (validVMA.length < 4) {
    alert("Pas assez de données valides avec VMA pour former un groupe.");
    return;
  }

  // 2. On trie par VMA décroissante
  validVMA.sort((a, b) => b.vma - a.vma);

  const groups = [];

  while (validVMA.length >= 4) {
    const high = validVMA.shift(); // 1er plus rapide
    const low = validVMA.pop(); // dernier plus lent
    const mid1 = validVMA.shift(); // 2e plus rapide restant
    const mid2 = validVMA.pop(); // 2e plus lent restant

    groups.push([high, mid1, mid2, low]);
  }

  // 3. Affichage
  groupsDisplay.innerHTML = "<h3>Groupes créés</h3>";
  groups.forEach((group, i) => {
    const groupHTML = `
      <div style="margin-bottom:15px;">
        <strong>Groupe ${i + 1} :</strong><br/>
        ${group.map(el => `• ${el.nom} (${el.vma} km/h) - ${el.classe}`).join("<br/>")}
      </div>
    `;
    groupsDisplay.innerHTML += groupHTML;
  });

  // 4. Export CSV groupes
  const csv = groups.map((group, i) => {
    return group.map(el => `Groupe ${i + 1},${el.nom},${el.classe},${el.vma}`).join("\n");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "groupes_VMA.csv";
  downloadLink.textContent = "Télécharger les groupes en CSV";
  downloadLink.style.display = "block";
  downloadLink.style.marginTop = "20px";
  groupsDisplay.appendChild(downloadLink);
});
