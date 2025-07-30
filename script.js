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
