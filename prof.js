const pinInput = document.getElementById('pin');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('login-msg');
const profSection = document.getElementById('prof-section');
const loginSection = document.getElementById('login-section');

const startScanBtn = document.getElementById('startScanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const video = document.getElementById('video');

const dataTableBody = document.querySelector('#dataTable tbody');
const searchInput = document.getElementById('searchInput');
const exportCSVBtn = document.getElementById('exportCSVBtn');

const PIN_CODE = 'EPS76';

let scanning = false;
let videoStream;
let dataRecords = [];

// --- Login ---
loginBtn.addEventListener('click', () => {
  const pin = pinInput.value.trim();
  if (pin === PIN_CODE) {
    loginSection.style.display = 'none';
    profSection.style.display = 'block';
    loginMsg.textContent = '';
  } else {
    loginMsg.textContent = 'Code PIN incorrect';
  }
});

// --- Scan QR code ---
startScanBtn.addEventListener('click', () => {
  if (scanning) return;
  startCamera();
});

stopScanBtn.addEventListener('click', () => {
  stopCamera();
});

// Fonction démarrer caméra + scanner
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      scanning = true;
      videoStream = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // ios
      video.play();
      stopScanBtn.disabled = false;
      startScanBtn.disabled = true;
      scanLoop();
    })
    .catch(err => alert("Erreur accès caméra : " + err));
}

function stopCamera() {
  scanning = false;
  stopScanBtn.disabled = true;
  startScanBtn.disabled = false;
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }
}

// Scanner en boucle
function scanLoop() {
  if (!scanning) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height);

  if (code) {
    try {
      const jsonData = JSON.parse(code.data);
      addDataRecord(jsonData);
      alert("Données scannées et ajoutées");
      // arrête la caméra après scan réussi
      stopCamera();
    } catch (e) {
      console.error("QR code non valide", e);
    }
  } else {
    requestAnimationFrame(scanLoop);
  }
}

// Ajouter données dans tableau
function addDataRecord(data) {
  // Vérifier doublons sur eleve1.nom + eleve1.prenom
  const exists = dataRecords.some(r =>
    r.eleve1.nom === data.eleve1.nom &&
    r.eleve1.prenom === data.eleve1.prenom
  );
  if (!exists) {
    dataRecords.push(data);
    renderTable();
  } else {
    alert("Cet élève a déjà été scanné.");
  }
}

// Afficher tableau
function renderTable() {
  dataTableBody.innerHTML = '';
  const filterText = searchInput.value.toLowerCase();

  dataRecords
    .filter(d => d.eleve1.nom.toLowerCase().includes(filterText))
    .forEach(d => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${d.eleve1.nom}</td>
        <td>${d.eleve1.prenom}</td>
        <td>${d.eleve1.sexe}</td>
        <td>${(d.tours * d.distanceTour).toFixed(2)}</td>
        <td>${d.vmaEstimee.toFixed(2)}</td>
      `;
      dataTableBody.appendChild(tr);
    });
}

// Recherche dynamique
searchInput.addEventListener('input', renderTable);

// Export CSV simple
exportCSVBtn.addEventListener('click', () => {
  if (dataRecords.length === 0) {
    alert("Aucune donnée à exporter.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Nom,Prénom,Sexe,Distance parcourue (m),VMA estimée (m/min)\n";

  dataRecords.forEach(d => {
    csvContent += `${d.eleve1.nom},${d.eleve1.prenom},${d.eleve1.sexe},${(d.tours * d.distanceTour).toFixed(2)},${d.vmaEstimee.toFixed(2)}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "runstats_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
