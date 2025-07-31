
// Variables globales
let timer, time = 0, laps = 0, dureeMin = 0, distanceTour = 0;
let dataEleves = [];
let scanner, scanActive = false;

// Sélecteurs
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const chronoDisplay = document.getElementById('chronoDisplay');
const lapsCount = document.getElementById('lapsCount');
const distanceTotal = document.getElementById('distanceTotal');
const distanceKm = document.getElementById('distanceKm');
const vitesseMoy = document.getElementById('vitesseMoy');
const vmaReal = document.getElementById('vmaReal');
const etatBtns = document.querySelectorAll('.etatBtn');
const qrContainer = document.getElementById('qrContainer');
const qrCodeBox = document.getElementById('qrCodeBox');
const profPinInput = document.getElementById('profPinInput');
const profPinSubmit = document.getElementById('profPinSubmit');
const logoutBtn = document.getElementById('logoutBtn');
const studentInput = document.getElementById('studentInput');
const profDashboard = document.getElementById('profDashboard');
const resultsBody = document.getElementById('resultsBody');
const qrReader = document.getElementById('qr-reader');
const stopScanBtn = document.getElementById('stopScanBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const generateGroupsBtn = document.getElementById('generateGroupsBtn');
const groupsDisplay = document.getElementById('groupsDisplay');

// Chrono
startBtn.addEventListener('click', () => {
  dureeMin = parseFloat(document.getElementById('duree').value);
  distanceTour = parseFloat(document.getElementById('distanceTour').value);
  if (!dureeMin || !distanceTour) {
    alert("Veuillez entrer une durée et une distance de tour valides.");
    return;
  }

  time = 0;
  laps = 0;
  chronoDisplay.textContent = "00:00";
  chronoDisplay.classList.remove("red", "orange");
  lapsCount.textContent = "0";
  distanceTotal.textContent = "0";
  distanceKm.textContent = "0.00";
  vitesseMoy.textContent = "0.00";
  vmaReal.textContent = "0.00";

  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;

  timer = setInterval(() => {
    time++;
    let min = Math.floor(time / 60);
    let sec = time % 60;
    chronoDisplay.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    if (dureeMin * 60 - time === 10) chronoDisplay.classList.add("orange");
    if (time >= dureeMin * 60) {
      clearInterval(timer);
      chronoDisplay.classList.remove("orange");
      chronoDisplay.classList.add("red");
      lapBtn.disabled = true;
      document.getElementById("etatForme").style.display = "block";
    }
  }, 1000);
});

lapBtn.addEventListener('click', () => {
  laps++;
  lapsCount.textContent = laps;
  const dist = laps * distanceTour;
  distanceTotal.textContent = dist;
  distanceKm.textContent = (dist / 1000).toFixed(2);
  const vit = (dist / 1000) / (time / 3600);
  vitesseMoy.textContent = isNaN(vit) ? "0.00" : vit.toFixed(2);
  vmaReal.textContent = isNaN(vit) ? "0.00" : vit.toFixed(2);
});

resetBtn.addEventListener('click', () => location.reload());

etatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;
    const nom = document.getElementById('nom1').value;
    const prenom = document.getElementById('prenom1').value;
    const classe = document.getElementById('classe1').value;
    const nom2 = document.getElementById('nom2').value;
    const prenom2 = document.getElementById('prenom2').value;
    const classe2 = document.getElementById('classe2').value;
    const vmaRef = parseFloat(document.getElementById('vmaRef').value) || "";

    const eleves = [
      { nom, prenom, classe, duree: dureeMin, distance: laps * distanceTour, vitesse: parseFloat(vitesseMoy.textContent), vma: parseFloat(vmaReal.textContent), etat },
      { nom: nom2, prenom: prenom2, classe: classe2, duree: dureeMin, distance: laps * distanceTour, vitesse: parseFloat(vitesseMoy.textContent), vma: parseFloat(vmaReal.textContent), etat }
    ];

    dataEleves.push(...eleves);
    const jsonData = JSON.stringify(eleves);
    qrContainer.style.display = "block";
    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: jsonData,
      width: 200,
      height: 200
    });
  });
});

// Authentification prof
profPinSubmit.addEventListener('click', () => {
  if (profPinInput.value === "7890") {
    studentInput.style.display = "none";
    profDashboard.style.display = "block";
    logoutBtn.style.display = "inline-block";
    initScanner();
  } else {
    alert("Code incorrect.");
  }
});

logoutBtn.addEventListener('click', () => location.reload());

// Scanner QR
function initScanner() {
  scanner = new Html5Qrcode("qr-reader");
  scanActive = true;

  scanner.start({ facingMode: "environment" }, {
    fps: 10,
    qrbox: 250
  }, onScanSuccess);
}

stopScanBtn.addEventListener('click', () => {
  if (scanActive) {
    scanner.stop().then(() => scanActive = false);
  }
});

function onScanSuccess(decodedText) {
  try {
    const eleves = JSON.parse(decodedText);
    eleves.forEach(e => addToTable(e));
  } catch (e) {
    alert("QR invalide");
  }
}

function addToTable(eleve) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>-</td>
    <td>${eleve.nom}</td>
    <td>${eleve.prenom}</td>
    <td>${eleve.classe}</td>
    <td>${eleve.duree}</td>
    <td>${eleve.distance}</td>
    <td>${eleve.vitesse.toFixed(2)}</td>
    <td>${eleve.vma.toFixed(2)}</td>
    <td>${eleve.etat}</td>
  `;
  resultsBody.appendChild(row);
}

// CSV export
exportCsvBtn.addEventListener('click', () => {
  const rows = [["Groupe", "Nom", "Prénom", "Classe", "Durée", "Distance", "Vitesse", "VMA", "État"]];
  resultsBody.querySelectorAll("tr").forEach(tr => {
    const cols = Array.from(tr.children).map(td => td.textContent);
    rows.push(cols);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "runstats.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Group generation
generateGroupsBtn.addEventListener('click', () => {
  const all = Array.from(resultsBody.querySelectorAll("tr")).map(tr => {
    const tds = tr.children;
    return {
      nom: tds[1].textContent,
      prenom: tds[2].textContent,
      classe: tds[3].textContent,
      vma: parseFloat(tds[7].textContent) || 0
    };
  });

  all.sort((a, b) => b.vma - a.vma);

  const groups = [];
  while (all.length >= 4) {
    const high = all.shift();
    const low = all.pop();
    const mid1 = all.shift();
    const mid2 = all.pop();
    groups.push([high, mid1, mid2, low]);
  }

  groupsDisplay.innerHTML = "";
  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Groupe ${i + 1}</h3><ul>${group.map(e => `<li>${e.prenom} ${e.nom} (${e.vma} km/h)</li>`).join("")}</ul>`;
    groupsDisplay.appendChild(div);
  });
});
