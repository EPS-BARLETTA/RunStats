document.addEventListener("DOMContentLoaded", () => {
  let timer;
  let time = 0;
  let laps = 0;
  let etat = "";
  let currentPin = "7890";
  let scanInProgress = false;
  let results = [];

  const startBtn = document.getElementById("startBtn");
  const lapBtn = document.getElementById("lapBtn");
  const resetBtn = document.getElementById("resetBtn");
  const chronoDisplay = document.getElementById("chronoDisplay");
  const lapsCount = document.getElementById("lapsCount");
  const distanceTotal = document.getElementById("distanceTotal");
  const distanceKm = document.getElementById("distanceKm");
  const vitesseMoy = document.getElementById("vitesseMoy");
  const vmaReal = document.getElementById("vmaReal");
  const etatBtns = document.querySelectorAll(".etatBtn");
  const qrContainer = document.getElementById("qrContainer");
  const qrCodeBox = document.getElementById("qrCodeBox");
  const etatForme = document.getElementById("etatForme");

  function formatTime(t) {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateDisplay() {
    chronoDisplay.textContent = formatTime(time);
    lapsCount.textContent = laps;
    const distanceTour = parseFloat(document.getElementById("distanceTour").value) || 0;
    const vmaRef = parseFloat(document.getElementById("vmaRef").value) || 0;
    const dureeMin = parseFloat(document.getElementById("duree").value) || 0;

    const distance = laps * distanceTour;
    const distanceInKm = distance / 1000;
    const dureeEnHeure = time / 3600;

    distanceTotal.textContent = distance.toFixed(0);
    distanceKm.textContent = distanceInKm.toFixed(2);
    vitesseMoy.textContent = (dureeEnHeure > 0 ? distanceInKm / dureeEnHeure : 0).toFixed(2);
    vmaReal.textContent = ((distanceInKm / dureeEnHeure) * 1.2).toFixed(2);
  }

  startBtn.addEventListener("click", () => {
    const dureeMin = parseFloat(document.getElementById("duree").value);
    if (!dureeMin || dureeMin <= 0) {
      alert("Veuillez saisir une durée valide.");
      return;
    }

    startBtn.disabled = true;
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    chronoDisplay.classList.remove("red");

    timer = setInterval(() => {
      time++;
      updateDisplay();

      if (time >= dureeMin * 60) {
        clearInterval(timer);
        chronoDisplay.classList.add("red");
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
    updateDisplay();
    etatForme.style.display = "none";
    chronoDisplay.classList.remove("red");
  });

  etatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      etat = btn.dataset.etat;
      generateQRCode();
    });
  });

  function generateQRCode() {
    const nom1 = document.getElementById("nom1").value.trim();
    const prenom1 = document.getElementById("prenom1").value.trim();
    const classe1 = document.getElementById("classe1").value.trim();

    const nom2 = document.getElementById("nom2").value.trim();
    const prenom2 = document.getElementById("prenom2").value.trim();
    const classe2 = document.getElementById("classe2").value.trim();

    const duree = document.getElementById("duree").value;
    const dist = distanceTotal.textContent;
    const vit = vitesseMoy.textContent;
    const vma = vmaReal.textContent;

    const data = {
      groupe: new Date().toISOString(),
      eleve1: `${prenom1} ${nom1}`,
      eleve2: `${prenom2} ${nom2}`,
      classe: classe1 || classe2,
      duree: `${duree} min`,
      distance: `${dist} m`,
      vitesse: `${vit} km/h`,
      vma: `${vma} km/h`,
      etat
    };

    const text = JSON.stringify(data);
    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text,
      width: 200,
      height: 200
    });
    qrContainer.style.display = "block";
  }

  function updateTable() {
    const table = document.getElementById("resultsTable");
    const tbody = document.createElement("tbody");

    results.sort((a, b) =>
      (a.classe + a.eleve1).localeCompare(b.classe + b.eleve1)
    );

    results.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.classe}</td>
        <td>${r.eleve1}</td>
        <td>${r.eleve2}</td>
        <td>${r.duree}</td>
        <td>${r.distance}</td>
        <td>${r.vitesse}</td>
        <td>${r.vma}</td>
        <td>${r.etat || "-"}</td>
      `;
      tbody.appendChild(tr);
    });

    const oldBody = table.querySelector("tbody");
    if (oldBody) table.removeChild(oldBody);
    table.appendChild(tbody);
  }

  document.getElementById("exportCsvBtn").addEventListener("click", () => {
    if (results.length === 0) return alert("Aucun résultat à exporter.");

    const header = [
      "Classe", "Élève 1", "Élève 2", "Durée", "Distance", "Vitesse", "VMA", "État"
    ];

    const rows = results.map(r => [
      r.classe,
      r.eleve1,
      r.eleve2,
      r.duree,
      r.distance,
      r.vitesse,
      r.vma,
      r.etat || ""
    ]);

    const csvContent = [header, ...rows]
      .map(e => e.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "resultats_course.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  document.getElementById("pinSubmit").addEventListener("click", () => {
    const pinInput = document.getElementById("pinInput").value;
    if (pinInput === currentPin) {
      document.getElementById("profDashboard").style.display = "block";
      document.getElementById("profAccess").style.display = "none";
      startQrScanner();
    } else {
      alert("Code incorrect");
    }
  });

  function startQrScanner() {
    if (scanInProgress) return;

    const qrReader = new Html5Qrcode("qr-reader");
    scanInProgress = true;

    qrReader.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (!results.some(r =>
            r.eleve1 === data.eleve1 &&
            r.eleve2 === data.eleve2 &&
            r.classe === data.classe
          )) {
            results.push(data);
            updateTable();
          }
        } catch (e) {
          alert("QR Code invalide ou mal formé.");
        }
      },
      (error) => {
        // Ne rien faire sur erreurs mineures
      }
    ).catch(err => {
      console.error("Erreur scanner QR :", err);
    });
  }
});
