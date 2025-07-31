// Global variables
let timer;
let time = 0;
let dureeSec = 0;
let laps = 0;
let etat = "";
let qrScanner;
let scannedData = []; // Pour stocker les données scannées
const PIN_PROF = "7890";

// DOM Elements
const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const etatForme = document.getElementById("etatForme");
const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

// Élèves form elements
const eleve1Input = document.getElementById("eleve1");
const eleve2Input = document.getElementById("eleve2");
const dureeInput = document.getElementById("duree");
const distanceInput = document.getElementById("distance");
const vmaInput = document.getElementById("vma");

// Prof elements
const profAccess = document.getElementById("profAccess");
const profPinInput = document.getElementById("profPinInput");
const profPinSubmit = document.getElementById("profPinSubmit");
const logoutBtn = document.getElementById("logoutBtn");
const profDashboard = document.getElementById("profDashboard");
const qrScanContainer = document.getElementById("qr-scan-container");
const stopScanBtn = document.getElementById("stopScanBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const generateGroupsBtn = document.getElementById("generateGroupsBtn");
const groupsDisplay = document.getElementById("groupsDisplay");
const scanResultDisplay = document.getElementById("scanResultDisplay");

// Format time mm:ss
function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateDisplay() {
  chronoDisplay.textContent = formatTime(time);
  lapsCount.textContent = laps;
  // Color change logic
  if(dureeSec - time <= 10 && dureeSec - time > 0){
    chronoDisplay.classList.add("orange");
    chronoDisplay.classList.remove("red");
  } else if(time >= dureeSec){
    chronoDisplay.classList.add("red");
    chronoDisplay.classList.remove("orange");
  } else {
    chronoDisplay.classList.remove("red");
    chronoDisplay.classList.remove("orange");
  }
}

startBtn.addEventListener("click", () => {
  const dureeMin = parseFloat(dureeInput.value);
  if (!dureeMin || dureeMin <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }
  const dist = parseFloat(distanceInput.value);
  if(!dist || dist <= 0){
    alert("Veuillez saisir une distance valide.");
    return;
  }
  if(!eleve1Input.value.trim() || !eleve2Input.value.trim()){
    alert("Veuillez saisir les noms des deux élèves.");
    return;
  }

  // Init
  dureeSec = Math.floor(dureeMin * 60);
  time = 0;
  laps = 0;
  etat = "";
  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  eleve1Input.disabled = true;
  eleve2Input.disabled = true;
  dureeInput.disabled = true;
  distanceInput.disabled = true;
  vmaInput.disabled = true;
  chronoDisplay.classList.remove("red", "orange");
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";
  etatForme.style.display = "none";
  updateDisplay();

  timer = setInterval(() => {
    time++;
    updateDisplay();

    if(time >= dureeSec) {
      clearInterval(timer);
      lapBtn.disabled = true;
      etatForme.style.display = "block";
    }
  }, 1000);
});

lapBtn.addEventListener("click", () => {
  laps++;
  updateDisplay();
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  time = 0;
  laps = 0;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  eleve1Input.disabled = false;
  eleve2Input.disabled = false;
  dureeInput.disabled = false;
  distanceInput.disabled = false;
  vmaInput.disabled = false;
  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";
  chronoDisplay.classList.remove("red", "orange");
  updateDisplay();
});

document.querySelectorAll(".etatBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    etat = btn.dataset.etat;
    etatForme.style.display = "none";

    // Calcul vitesse moyenne (distance en km / durée en h)
    const distKm = parseFloat(distanceInput.value);
    const dureeH = dureeSec / 3600;
    const vitesse = distKm / dureeH;

    // Données à encoder dans le QR code
    const data = {
      eleve1: eleve1Input.value.trim(),
      eleve2: eleve2Input.value.trim(),
      duree: formatTime(time),
      distance: distKm.toFixed(2),
      vitesse: vitesse.toFixed(2),
      vma: vmaInput.value ? parseFloat(vmaInput.value).toFixed(2) : null,
      tours: laps,
      etat: etat,
      timestamp: new Date().toISOString()
    };

    const text = JSON.stringify(data);
    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: text,
      width: 220,
      height: 220
    });

    qrContainer.style.display = "block";
  });
});

// --- PROF SECTION ---

// Show/hide prof dashboard
function showProfDashboard(show){
  profAccess.style.display = show ? "none" : "block";
  profDashboard.style.display = show ? "block" : "none";
  scannedData = [];
  groupsDisplay.innerHTML = "";
  scanResultDisplay.textContent = "";
  if(qrScanner){
    qrScanner.clear();
    qrScanner = null;
  }
}

profPinSubmit.addEventListener("click", () => {
  const pin = profPinInput.value.trim();
  if(pin === PIN_PROF){
    profPinInput.value = "";
    showProfDashboard(true);
  } else {
    alert("Code PIN incorrect");
  }
});

logoutBtn.addEventListener("click", () => {
  showProfDashboard(false);
});

// Setup QR scanner (uses Html5Qrcode lib)
function startScanner(){
  if(qrScanner) return;
  qrScanner = new Html5Qrcode("qr-scan-container");

  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeSuccessCallback,
    qrCodeErrorCallback
  ).catch(err => {
    scanResultDisplay.textContent = `Erreur caméra : ${err}`;
  });
}

function stopScanner(){
  if(!qrScanner) return;
  qrScanner.stop().then(() => {
    qrScanner.clear();
    qrScanner = null;
    scanResultDisplay.textContent = "Scanner arrêté.";
  }).catch(err => {
    scanResultDisplay.textContent = `Erreur arrêt scanner : ${err}`;
  });
}

function qrCodeSuccessCallback(decodedText, decodedResult){
  // parsed JSON
  try {
    const data = JSON.parse(decodedText);
    // Evite doublons via timestamp + eleve1 + eleve2
    const exists = scannedData.some(item => item.timestamp === data.timestamp && item.eleve1 === data.eleve1 && item.eleve2 === data.eleve2);
    if(!exists){
      scannedData.push(data);
      scanResultDisplay.textContent = `Données scannées: ${data.eleve1} & ${data.eleve2}`;
    } else {
      scanResultDisplay.textContent = "QR code déjà scanné";
    }
  } catch(e) {
    scanResultDisplay.textContent = "QR code non reconnu";
  }
}

function qrCodeErrorCallback(errorMessage){
  // Pas d'action nécessaire en cas d'erreur de scan temporaire
}

// Generate groups: binômes de 2 avec mix de VMA (1 haute, 1 basse, 2 intermédiaires)
// Attention : ici on crée les groupes à partir des binômes scannés, en regroupant binômes par VMA globale
generateGroupsBtn.addEventListener("click", () => {
  if(scannedData.length < 2){
    alert("Il faut au moins deux binômes scannés pour créer des groupes.");
    return;
  }

  // Séparer chaque élève en liste individuelle avec VMA
  const eleves = [];
  scannedData.forEach(binome => {
    // Deux élèves dans un binôme
    eleves.push({
      nom: binome.eleve1,
      vma: binome.vma ? parseFloat(binome.vma) : null,
      duree: binome.duree,
      distance: parseFloat(binome.distance),
      vitesse: parseFloat(binome.vitesse),
      etat: binome.etat,
      timestamp: binome.timestamp,
      binomeId: binome.timestamp // On rattache au binôme
    });
    eleves.push({
      nom: binome.eleve2,
      vma: binome.vma ? parseFloat(binome.vma) : null,
      duree: binome.duree,
      distance: parseFloat(binome.distance),
      vitesse: parseFloat(binome.vitesse),
      etat: binome.etat,
      timestamp: binome.timestamp,
      binomeId: binome.timestamp
    });
  });

  // Trier élèves par VMA (null dernières)
  eleves.sort((a,b) => {
    if(a.vma === null) return 1;
    if(b.vma === null) return -1;
    return b.vma - a.vma;
  });

  // Former groupes de 4 (mixte : 1 haute, 1 basse, 2 intermédiaires)
  // On va faire simple: dans chaque groupe de 4, premier est haute VMA, dernier basse VMA, 2 intermédiaires au milieu

  const groupes = [];
  for(let i=0; i < eleves.length; i += 4){
    const groupe = eleves.slice(i, i+4);
    if(groupe.length === 4){
      groupes.push(groupe);
    }
  }

  // Affichage
  let html = "";
  groupes.forEach((grp, i) => {
    html += `<h3>Groupe ${i+1}</h3><ul>`;
    grp.forEach(e => {
      html += `<li>${e.nom} - VMA: ${e.vma !== null ? e.vma : "N/A"}, Distance: ${e.distance} km, Vitesse: ${e.vitesse} km/h, État: ${e.etat}</li>`;
    });
    html += "</ul>";
  });

  if(html === ""){
    html = "<p>Pas assez d'élèves pour former des groupes de 4.</p>";
  }

  groupsDisplay.innerHTML = html;
});

// Export CSV
exportCsvBtn.addEventListener("click", () => {
  if(scannedData.length === 0){
    alert("Aucune donnée à exporter.");
    return;
  }
  let csv = "Eleve1,Eleve2,Duree,Distance(km),Vitesse(km/h),VMA, Tours, Etat, Timestamp\n";
  scannedData.forEach(d => {
    csv += `"${d.eleve1}","${d.eleve2}",${d.duree},${d.distance},${d.vitesse},${d.vma !== null ? d.vma : ""},${d.tours},"${d.etat}",${d.timestamp}\n`;
  });

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'runstats_data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
