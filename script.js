// Variables globales
let eleve1Done = false;
let eleve2Done = false;
let eleve1Data = null;
let eleve2Data = null;
let qrDataArray = [];

// --- Gestion des boutons état ---
const etatButtons = document.querySelectorAll('.etatBtn');
etatButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const eleveNum = btn.dataset.eleve;
    const etat = btn.dataset.etat;

    if (eleveNum === "1") {
      collectEleveData(1, etat);
    } else {
      collectEleveData(2, etat);
    }
  });
});

function collectEleveData(eleveNum, etat) {
  const nom = document.getElementById(`nom${eleveNum}`).value.trim();
  const prenom = document.getElementById(`prenom${eleveNum}`).value.trim();
  const sexe = document.getElementById(`sexe${eleveNum}`).value;
  const duree = parseFloat(document.getElementById(`duree${eleveNum}`).value);

  if (!nom || !prenom || !sexe || !duree || duree <= 0) {
    alert(`Veuillez remplir tous les champs valides pour l'élève ${eleveNum}`);
    return;
  }

  const vma = calculateVMA(duree);

  const eleveData = {
    nom,
    prenom,
    sexe,
    duree,
    etat,
    vma: vma.toFixed(2),
  };

  if (eleveNum === 1) {
    eleve1Data = eleveData;
    eleve1Done = true;
    alert("Données Élève 1 enregistrées. Veuillez renseigner l'élève 2.");
  } else {
    eleve2Data = eleveData;
    eleve2Done = true;
  }

  if (eleve1Done && eleve2Done) {
    generateQRCode([eleve1Data, eleve2Data]);
  }
}

function calculateVMA(duree) {
  // Formule simple : VMA = 1000 / durée en minutes (exemple)
  // Tu peux adapter selon tes règles de calcul
  return 1000 / duree;
}

// --- Génération QR Code ---
function generateQRCode(data) {
  document.getElementById('qrSection').style.display = 'block';
  const container = document.getElementById('qrCodeBox');
  container.innerHTML = "";
  new QRCode(container, {
    text: JSON.stringify(data),
    width: 200,
    height: 200,
  });
}

// --- Prof Access ---
const profPinSubmit = document.getElementById("profPinSubmit");
const profPinInput = document.getElementById("profPinInput");
const profDashboard = document.getElementById("profDashboard");
const logoutBtn = document.getElementById("logoutBtn");
const studentInputs = document.getElementById("elevesSection");

profPinSubmit.addEventListener("click", () => {
  if (profPinInput.value === "1976") {
    profDashboard.style.display = "block";
    studentInputs.style.display = "none";
    logoutBtn.style.display = "inline-block";
    profPinInput.value = "";
    startQrScanner();
  } else {
    alert("Code incorrect.");
  }
});

logoutBtn.addEventListener("click", () => {
  location.reload();
});

// --- QR Code Scan côté prof ---
let qrReaderInstance = null;
const qrDataReceived = [];

function startQrScanner() {
  qrReaderInstance = new Html5Qrcode("qr-reader");
  qrReaderInstance.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
    (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        // Éviter doublons
        data.forEach(item => {
          if (!qrDataArray.some(e => e.nom === item.nom && e.prenom === item.prenom)) {
            qrDataArray.push(item);
          }
        });
        updateTable();
      } catch {
        console.warn("QR Code non lisible");
      }
    },
    (error) => {
      // console.warn(`QR scan error: ${error}`);
    }
  ).catch(err => console.error("Erreur de démarrage du scanner QR: ", err));
}

document.getElementById("stopScanBtn").addEventListener("click", () => {
  if (qrReaderInstance) {
    qrReaderInstance.stop().then(() => {
      document.getElementById("qr-reader").innerHTML = "";
    });
  }
});

// --- Mise à jour tableau ---
const resultsBody = document.getElementById("resultsBody");

function updateTable() {
  resultsBody.innerHTML = "";
  qrDataArray.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.nom}</td>
      <td>${d.prenom}</td>
      <td>${d.sexe}</td>
      <td>${d.duree}</td>
      <td>${d.etat}</td>
      <td>${d.vma}</td>
    `;
    resultsBody.appendChild(tr);
  });
}

// --- Export CSV ---
const exportCsvBtn = document.getElementById("exportCsvBtn");
exportCsvBtn.addEventListener("click", () => {
  let csv = "Nom,Prénom,Sexe,Durée,État,VMA\n";
  qrDataArray.forEach(d => {
    csv += `${d.nom},${d.prenom},${d.sexe},${d.duree},${d.etat},${d.vma}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "RunStats_Resultats.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Tri et création des groupes ---
const trierGroupesBtn = document.getElementById("trierGroupesBtn");
const groupesContainer = document.getElementById("groupesContainer");

trierGroupesBtn.addEventListener("click", () => {
  if (qrDataArray.length < 4) {
    alert("Au moins 4 élèves sont nécessaires pour créer les groupes.");
    return;
  }
  const groupes = creerGroupesMixteVMA(qrDataArray);
  afficherGroupes(groupes);
});

function creerGroupesMixteVMA(data) {
  // On classe les élèves selon VMA
  const haute = data.filter(d => d.vma >= 12); // seuil haute
  const basse = data.filter(d => d.vma <= 8);  // seuil basse
  const moyenne = data.filter(d => d.vma > 8 && d.vma < 12);

  const groupes = [];
  const groupesCount = Math.floor(data.length / 4);

  for (let i = 0; i < groupesCount; i++) {
    const groupe = [];

    // Une haute
    if (haute.length > 0) groupe.push(haute.shift());
    // Deux moyennes
    if (moyenne.length > 0) groupe.push(moyenne.shift());
    if (moyenne.length > 0) groupe.push(moyenne.shift());
    // Une basse
    if (basse.length > 0) groupe.push(basse.shift());

    // Ajuster mixité : s'assurer qu'il y ait au moins un garçon et une fille
    if (!groupe.some(e => e.sexe === "M") && data.some(e => e.sexe === "M")) {
      // Remplacer un élève fille par garçon si possible
      let remplacant = data.find(e => e.sexe === "M" && !groupe.includes(e));
      if (remplacant) {
        groupe[0] = remplacant; // remplacer premier élève
      }
    }
    if (!groupe.some(e => e.sexe === "F") && data.some(e => e.sexe === "F")) {
      let remplacant = data.find(e => e.sexe === "F" && !groupe.includes(e));
      if (remplacant) {
        groupe[1] = remplacant;
      }
    }

    groupes.push(groupe);
  }

  return groupes;
}

function afficherGroupes(groupes) {
  groupesContainer.innerHTML = "";
  groupes.forEach((groupe, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Groupe ${i + 1}</h3>`;
    const ul = document.createElement("ul");
    groupe.forEach(eleve => {
      const li = document.createElement("li");
      li.textContent = `${eleve.nom} ${eleve.prenom} - Sexe: ${eleve.sexe} - VMA: ${eleve.vma}`;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    groupesContainer.appendChild(div);
  });
}
