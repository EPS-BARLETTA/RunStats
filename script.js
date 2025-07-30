// -------- Variables générales --------
let chrono = 0;
let intervalId = null;
let etat1 = "", etat2 = "";
let groupeData = [];

// -------- Sélecteurs DOM --------
const chronoDisplay = document.getElementById("chronoDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const etatBtns1 = document.querySelectorAll(".etatBtn1");
const etatBtns2 = document.querySelectorAll(".etatBtn2");

const qrContainer = document.getElementById("qrResult");
const exportBtn = document.getElementById("exportBtn");

// -------- Fonctions --------
function formatTime(secs) {
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}

function updateChrono() {
  chrono++;
  chronoDisplay.textContent = formatTime(chrono);
}

function startChrono() {
  if (!intervalId) {
    intervalId = setInterval(updateChrono, 1000);
  }
}

function stopChrono() {
  clearInterval(intervalId);
  intervalId = null;
}

function resetChrono() {
  stopChrono();
  chrono = 0;
  chronoDisplay.textContent = "00:00";
}

// -------- États de forme --------
etatBtns1.forEach(btn => {
  btn.addEventListener("click", () => {
    etat1 = btn.getAttribute("data-etat");
    etatBtns1.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

etatBtns2.forEach(btn => {
  btn.addEventListener("click", () => {
    etat2 = btn.getAttribute("data-etat");
    etatBtns2.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// -------- Création QR Code --------
function enregistrerGroupe() {
  const nom1 = document.getElementById("nom1").value;
  const prenom1 = document.getElementById("prenom1").value;
  const vma1 = parseFloat(document.getElementById("vma1").value);
  
  const nom2 = document.getElementById("nom2").value;
  const prenom2 = document.getElementById("prenom2").value;
  const vma2 = parseFloat(document.getElementById("vma2").value);

  if (!nom1 || !prenom1 || isNaN(vma1) || !etat1 ||
      !nom2 || !prenom2 || isNaN(vma2) || !etat2) {
    alert("Veuillez remplir tous les champs et sensations des deux élèves.");
    return;
  }

  const groupe = {
    chrono: formatTime(chrono),
    eleves: [
      { nom: nom1, prenom: prenom1, vma: vma1, etat: etat1 },
      { nom: nom2, prenom: prenom2, vma: vma2, etat: etat2 }
    ]
  };

  groupeData.push(groupe);
  genererQRCode(groupe);
  alert("Groupe enregistré !");
}

function genererQRCode(data) {
  qrContainer.innerHTML = "";
  const qr = new QRCode(qrContainer, {
    text: JSON.stringify(data),
    width: 200,
    height: 200
  });
}

// -------- Export CSV --------
exportBtn.addEventListener("click", () => {
  if (groupeData.length === 0) {
    alert("Aucun groupe enregistré.");
    return;
  }

  let csv = "Nom;Prénom;VMA;État;Chrono\n";
  groupeData.forEach(g => {
    g.eleves.forEach(e => {
      csv += `${e.nom};${e.prenom};${e.vma};${e.etat};${g.chrono}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultats_groupes.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// -------- Boutons chrono --------
startBtn.addEventListener("click", startChrono);
stopBtn.addEventListener("click", stopChrono);
resetBtn.addEventListener("click", resetChrono);

// Bouton valider le groupe
document.getElementById("validerGroupe").addEventListener("click", enregistrerGroupe);
// QR Scan avec Html5Qrcode
let html5QrCode;
const profData = [];

function startScanner() {
  if (html5QrCode) return;
  html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess
  ).catch(err => alert("Erreur caméra : " + err));
}

function onScanSuccess(decodedText) {
  try {
    const groupe = JSON.parse(decodedText);
    if (Array.isArray(groupe.eleves)) {
      groupe.eleves.forEach(e => profData.push({ ...e, chrono: groupe.chrono }));
      updateProfTable();
    }
  } catch (e) {
    alert("QR Code invalide.");
  }
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    });
  }
}

document.getElementById("stopScanBtn").addEventListener("click", stopScanner);

// Mise à jour du tableau prof
function updateProfTable() {
  const tbody = document.getElementById("profTableBody");
  tbody.innerHTML = "";
  profData.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.nom}</td>
      <td>${e.prenom}</td>
      <td>${e.vma}</td>
      <td>${e.etat}</td>
      <td>${e.chrono}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Bouton caché 3 clics
let clickCount = 0;
document.getElementById("footer").addEventListener("click", () => {
  clickCount++;
  if (clickCount >= 3) {
    clickCount = 0;
    document.getElementById("profSection").style.display = "block";
    startScanner();
  }
  setTimeout(() => (clickCount = 0), 1500);
});

// Générer groupes hétérogènes
document.getElementById("genererGroupesBtn").addEventListener("click", () => {
  const eleves = [...profData];
  eleves.sort((a, b) => b.vma - a.vma); // tri VMA décroissant

  const groupes = [];
  while (eleves.length >= 4) {
    const groupe = [
      eleves.shift(),          // VMA haute
      eleves.pop(),            // VMA basse
      eleves.splice(Math.floor(eleves.length/2), 1)[0], // intermédiaire
      eleves.splice(Math.floor(eleves.length/2), 1)[0]  // intermédiaire
    ];
    groupes.push(groupe);
  }

  const conteneur = document.getElementById("groupesFinal");
  conteneur.innerHTML = "<h3>Groupes hétérogènes :</h3>";
  groupes.forEach((g, i) => {
    conteneur.innerHTML += `<strong>Groupe ${i+1}</strong><ul>` +
      g.map(e => `<li>${e.prenom} ${e.nom} (VMA: ${e.vma})</li>`).join("") +
      `</ul>`;
  });
});

// Export CSV groupes
document.getElementById("exportGroupesBtn").addEventListener("click", () => {
  let csv = "Groupe;Nom;Prénom;VMA;État;Chrono\n";
  const lignes = [];

  const eleves = [...profData];
  eleves.sort((a, b) => b.vma - a.vma);

  let groupNum = 1;
  while (eleves.length >= 4) {
    const g = [
      eleves.shift(),
      eleves.pop(),
      eleves.splice(Math.floor(eleves.length/2), 1)[0],
      eleves.splice(Math.floor(eleves.length/2), 1)[0]
    ];
    g.forEach(e => {
      lignes.push(`${groupNum};${e.nom};${e.prenom};${e.vma};${e.etat};${e.chrono}`);
    });
    groupNum++;
  }

  const blob = new Blob(["Groupe;Nom;Prénom;VMA;État;Chrono\n" + lignes.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "groupes_heterogenes.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
