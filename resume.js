// resume.js
document.addEventListener("DOMContentLoaded", () => {
  const onlyDigits = (v) => (v || "").toString().replace(/[^\d]/g, "");
  const toNum = (v) => parseInt(onlyDigits(String(v)), 10) || 0;

  // Sécurise/normalise la durée stockée
  const rawDuree = sessionStorage.getItem("dureeCourse");
  const dureeCourse = toNum(rawDuree);
  // Optionnel : on remet en storage la version nettoyée (n'affecte pas l'UI)
  sessionStorage.setItem("dureeCourse", String(dureeCourse));

  // Charge + assainit les stats
  let stats = [];
  try {
    stats = JSON.parse(sessionStorage.getItem("stats") || "[]");
  } catch {
    stats = [];
  }

  function sanitizeEleve(e) {
    const distance = toNum(e.distance);
    const vitesse = dureeCourse > 0 ? (distance / 1000) / (dureeCourse / 60) : 0;
    const vma = vitesse * 1.15;
    return {
      ...e,
      nom: (e.nom || "").toString().trim(),
      prenom: (e.prenom || "").toString().trim(),
      classe: (e.classe || "").toString().trim(),
      sexe: (e.sexe || "").toString().trim(),
      distance,
      vitesse,
      vma
    };
  }

  // Assainit tout de suite la liste en mémoire (pas d'impact visuel)
  stats = Array.isArray(stats) ? stats.map(sanitizeEleve) : [];

  const tableBody = document.querySelector("#results tbody");
  const qrContainer = document.getElementById("qrcode");
  let modeProf = false;

  function renderTable() {
    tableBody.innerHTML = "";
    stats.forEach((eleve, index) => {
      const vit = Number(eleve.vitesse) || 0;
      const vma = Number(eleve.vma) || 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${eleve.nom}</td>
        <td>${eleve.prenom}</td>
        <td>${eleve.classe}</td>
        <td>${eleve.sexe}</td>
        <td>
          ${
            modeProf
              ? `<input type="number" value="${eleve.distance}" min="0" style="width:80px"
                         data-index="${index}" class="distance-input"
                         inputmode="numeric" pattern="[0-9]*" data-digits-only>`
              : eleve.distance
          }
        </td>
        <td>${vit.toFixed(2)}</td>
        <td>${vma.toFixed(2)}</td>
      `;
      tableBody.appendChild(tr);
    });

    if (modeProf) {
      // Active la restriction "chiffres uniquement" + recalcul live
      document.querySelectorAll(".distance-input").forEach((input) => {
        input.addEventListener("input", (e) => {
          const i = e.target.dataset.index;
          // Nettoyage live (empêche 'e', '.', 'min', etc.)
          e.target.value = onlyDigits(e.target.value);
          const nouvelleDistance = toNum(e.target.value);
          stats[i].distance = nouvelleDistance;
          recalculerVitesseVMA(stats[i]);
          renderTable();
          genererQR();
        });
      });
    }
  }

  function recalculerVitesseVMA(eleve) {
    const distance = toNum(eleve.distance);
    const vitesse = dureeCourse > 0 ? (distance / 1000) / (dureeCourse / 60) : 0;
    eleve.vitesse = vitesse;
    eleve.vma = vitesse * 1.15;
  }

  // Génération QR code (toujours sur base assainie)
  function genererQR() {
    const safeStats = stats.map(sanitizeEleve);
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: JSON.stringify(safeStats),
      width: 180,
      height: 180
    });
  }

  // Export CSV (à partir des données assainies)
  document.getElementById("exportCSV").addEventListener("click", () => {
    const safeStats = stats.map(sanitizeEleve);
    let csvContent = "Nom;Prénom;Classe;Sexe;Distance;Vitesse;VMA\n";
    safeStats.forEach((eleve) => {
      csvContent += `${eleve.nom};${eleve.prenom};${eleve.classe};${eleve.sexe};${eleve.distance};${(eleve.vitesse || 0).toFixed(2)};${(eleve.vma || 0).toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resultats.csv";
    link.click();
  });

  // Bouton Mode Prof
  document.getElementById("modeProf").addEventListener("click", () => {
    const pin = prompt("Entrez le code PIN :");
    if (pin === "57") {
      modeProf = !modeProf;
      renderTable();
    } else {
      alert("Code incorrect");
    }
  });

  // --- Moteur global "chiffres uniquement" pour inputs marqués data-digits-only ---
  (function enforceDigitsOnly() {
    const SEL = "[data-digits-only]";
    const onlyDigitsLocal = (v) => (v || "").toString().replace(/[^\d]/g, "");
    document.addEventListener(
      "beforeinput",
      (e) => {
        const el = e.target;
        if (!el || !el.matches?.(SEL)) return;
        if (e.data && /\D/.test(e.data)) e.preventDefault();
      },
      { capture: true }
    );
    document.addEventListener("input", (e) => {
      const el = e.target;
      if (!el || !el.matches?.(SEL)) return;
      const before = el.value;
      const after = onlyDigitsLocal(before);
      if (before !== after) {
        const delta = before.length - after.length;
        const pos = el.selectionStart;
        el.value = after;
        if (pos != null) {
          const caret = Math.max(0, pos - delta);
          el.setSelectionRange(caret, caret);
        }
      }
    });
    document.addEventListener("paste", (e) => {
      const el = e.target;
      if (!el || !el.matches?.(SEL)) return;
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      const ins = onlyDigitsLocal(text);
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      el.value = el.value.slice(0, start) + ins + el.value.slice(end);
      const caret = start + ins.length;
      el.setSelectionRange(caret, caret);
    });
  })();

  // Initialisation
  renderTable();
  genererQR();
});
