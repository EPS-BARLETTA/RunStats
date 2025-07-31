document.addEventListener("DOMContentLoaded", () => {
  // Eléments généraux
  const nom1 = document.getElementById("nom1");
  const prenom1 = document.getElementById("prenom1");
  const classe1 = document.getElementById("classe1");
  const nom2 = document.getElementById("nom2");
  const prenom2 = document.getElementById("prenom2");
  const classe2 = document.getElementById("classe2");

  const dureeInput = document.getElementById("duree");
  const distanceTourInput = document.getElementById("distanceTour");
  const vmaRefInput = document.getElementById("vmaRef");

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
  const etatBtns = document.querySelectorAll(".etatBtn");

  const qrContainer = document.getElementById("qrContainer");
  const qrCodeBox = document.getElementById("qrCodeBox");

  const profAccess = document.getElementById("profAccess");
  const profPinInput = document.getElementById("profPinInput");
  const profPinSubmit = document.getElementById("profPinSubmit");
  const logoutBtn = document.getElementById("logoutBtn");
  const studentInput = document.getElementById("studentInput");
  const profDashboard = document.getElementById("profDashboard");

  const qrReader = document.getElementById("qr-reader");
  const stopScanBtn = document.getElementById("stopScanBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const generateGroupsBtn = document.getElementById("generateGroupsBtn");
  const groupsDisplay = document.getElementById("groupsDisplay");
  const resultsBody = document.getElementById("resultsBody");

  let timer;
  let time = 0;
  let laps = 0;
  let dureeMin = 0;
  let distanceTour = 0;
  let currentEleveIndex = 0;
  let eleves = [];

  let scanner;
  let scanActif = false;

  startBtn.addEventListener("click", () => {
    dureeMin = parseFloat(dureeInput.value);
    distanceTour = parseFloat(distanceTourInput.value);

    if (!dureeMin || !distanceTour) {
      alert("Veuillez remplir la durée et la distance d’un tour.");
      return;
    }

    time = 0;
    laps = 0;
    lapsCount.textContent = laps;
    chronoDisplay.textContent = "00:00";
    chronoDisplay.classList.remove("red", "orange");

    lapBtn.disabled = false;
    resetBtn.disabled = false;
    startBtn.disabled = true;

    timer = setInterval(() => {
      time++;
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      chronoDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (time >= dureeMin * 60 - 10 && time < dureeMin * 60) {
        chronoDisplay.classList.add("orange");
      }

      if (time >= dureeMin * 60) {
        clearInterval(timer);
        chronoDisplay.classList.remove("orange");
        chronoDisplay.classList.add("red");
        lapBtn.disabled = true;
        etatForme.style.display = "block";
      }
    }, 1000);
  });

  lapBtn.addEventListener("click", () => {
    laps++;
    lapsCount.textContent = laps;
    const totalDistance = laps * distanceTour;
    const vitesse = (totalDistance / time) * 3.6;
    const vmaEstimee = vitesse * 1.15;

    distanceTotal.textContent = totalDistance;
    distanceKm.textContent = (totalDistance / 1000).toFixed(2);
    vitesseMoy.textContent = vitesse.toFixed(2);
    vmaReal.textContent = vmaEstimee.toFixed(2);
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timer);
    time = 0;
    laps = 0;
    lapsCount.textContent = 0;
    chronoDisplay.textContent = "00:00";
    chronoDisplay.classList.remove("red", "orange");
    distanceTotal.textContent = 0;
    distanceKm.textContent = "0.00";
    vitesseMoy.textContent = "0.00";
    vmaReal.textContent = "0.00";
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    startBtn.disabled = false;
    etatForme.style.display = "none";
    qrContainer.style.display = "none";
    qrCodeBox.innerHTML = "";
  });

  etatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const etat = btn.dataset.etat;

      const eleve = currentEleveIndex === 0 ? {
        nom: nom1.value.trim(),
        prenom: prenom1.value.trim(),
        classe: classe1.value.trim()
      } : {
        nom: nom2.value.trim(),
        prenom: prenom2.value.trim(),
        classe: classe2.value.trim()
      };

      const totalDistance = laps * distanceTour;
      const vitesse = (totalDistance / time) * 3.6;
      const vmaEstimee = vitesse * 1.15;

      const data = {
        nom: eleve.nom,
        prenom: eleve.prenom,
        classe: eleve.classe,
        duree: dureeMin,
        distance: totalDistance,
        vitesse: parseFloat(vitesse.toFixed(2)),
        vma: parseFloat(vmaEstimee.toFixed(2)),
        etat: etat
      };

      const jsonData = JSON.stringify(data);
      qrCodeBox.innerHTML = "";
      new QRCode(qrCodeBox, {
        text: jsonData,
        width: 200,
        height: 200
      });

      qrContainer.style.display = "block";
    });
  });

  profPinSubmit.addEventListener("click", () => {
    if (profPinInput.value === "7890") {
      profAccess.style.display = "none";
      studentInput.style.display = "none";
      profDashboard.style.display = "block";
      logoutBtn.style.display = "inline-block";
      lancerScan();
    } else {
      alert("Code incorrect.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    location.reload();
  });

  function lancerScan() {
    if (!scanActif) {
      scanner = new Html5Qrcode("qr-reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            eleves.push(data);
            afficherResultats();
          } catch (e) {
            console.error("QR non valide");
          }
        }
      );
      scanActif = true;
    }
  }

  stopScanBtn.addEventListener("click", () => {
    if (scanActif && scanner) {
      scanner.stop().then(() => {
        scanActif = false;
        scanner.clear();
      });
    }
  });

  function afficherResultats() {
    resultsBody.innerHTML = "";
    eleves.forEach((e, index) => {
      resultsBody.innerHTML += `
        <tr>
          <td>-</td>
          <td>${e.nom}</td>
          <td>${e.prenom}</td>
          <td>${e.classe}</td>
          <td>${e.duree} min</td>
          <td>${e.distance}</td>
          <td>${e.vitesse}</td>
          <td>${e.vma}</td>
          <td>${e.etat}</td>
        </tr>
      `;
    });
  }

  exportCsvBtn.addEventListener("click", () => {
    const headers = ["Groupe", "Nom", "Prénom", "Classe", "Durée", "Distance", "Vitesse", "VMA", "État"];
    const rows = eleves.map(e => ["-", e.nom, e.prenom, e.classe, e.duree, e.distance, e.vitesse, e.vma, e.etat]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "resultats_runstats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  generateGroupsBtn.addEventListener("click", () => {
    const shuffled = [...eleves].sort(() => 0.5 - Math.random());
    const groupes = [];

    while (shuffled.length >= 4) {
      const sorted = shuffled.splice(0, 4).sort((a, b) => b.vma - a.vma);
      groupes.push(sorted);
    }

    if (shuffled.length > 0) {
      groupes.push(shuffled);
    }

    groupsDisplay.innerHTML = groupes.map((groupe, index) => `
      <h4>Groupe ${index + 1}</h4>
      <ul>
        ${groupe.map(e => `<li>${e.prenom} ${e.nom} - VMA: ${e.vma}</li>`).join("")}
      </ul>
    `).join("");
  });
});
