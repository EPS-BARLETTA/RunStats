(function () {
  // --- Utilitaires sûrs ---
  const toNum = (x) => {
    const n = Number(String(x).replace(",", "."));
    return isFinite(n) ? n : 0;
  };
  const r2 = (n) => Math.round(n * 100) / 100;
  const safeText = (t) => (t ? String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "—");

  // --- Lecture sécurisée des données ---
  let stats = [];
  try {
    stats = JSON.parse(sessionStorage.getItem("stats")) || [];
  } catch (e) {
    stats = [];
  }

  // Reconstruction minimale si vide
  if (!stats || !stats.length) {
    const e1 = JSON.parse(sessionStorage.getItem("eleve1") || "{}");
    const e2 = JSON.parse(sessionStorage.getItem("eleve2") || "{}");
    const duree = toNum(sessionStorage.getItem("dureeCourse")) || 6;
    const fallback = [e1, e2].filter((x) => x && (x.nom || x.prenom));
    stats = fallback.map((e) => ({
      prenom: safeText(e.prenom),
      nom: safeText(e.nom),
      classe: safeText(e.classe),
      sexe: safeText(e.sexe),
      distance: r2(toNum(e.distance)),
      duree: r2(duree),
      vitesse: r2(toNum(e.vitesse)),
      vma: r2(toNum(e.vma)),
    }));
  }

  // --- Nettoyage & normalisation ---
  const rows = (stats || [])
    .filter((e) => e && (e.nom || e.prenom))
    .map((e) => ({
      prenom: safeText(e.prenom),
      nom: safeText(e.nom),
      classe: safeText(e.classe),
      sexe: safeText(e.sexe),
      distance: r2(toNum(e.distance)),
      duree: r2(toNum(e.duree) || 6),
      vitesse: r2(toNum(e.vitesse)),
      vma: r2(toNum(e.vma)),
    }));

  // --- Affichage du tableau ---
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
  rows.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.prenom}</td>
      <td>${e.nom}</td>
      <td>${e.classe}</td>
      <td>${e.sexe}</td>
      <td>${e.distance || "—"}</td>
      <td>${e.duree || "—"}</td>
      <td>${e.vitesse || "—"}</td>
      <td>${e.vma || "—"}</td>
    `;
    tbody.appendChild(tr);
  });

  // --- Export CSV ---
  const toCSV = (arr) => {
    const header = ["Prenom", "Nom", "Classe", "Sexe", "Distance", "Duree", "Vitesse", "VMA"];
    const lines = [header.join(",")];
    arr.forEach((e) => {
      lines.push([
        e.prenom,
        e.nom,
        e.classe,
        e.sexe,
        String(e.distance).replace(".", ","),
        String(e.duree).replace(".", ","),
        String(e.vitesse).replace(".", ","),
        String(e.vma).replace(".", ","),
      ].join(","));
    });
    return lines.join("\n");
  };

  document.getElementById("btnCsv").addEventListener("click", () => {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resultats_course.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  });

  document.getElementById("btnPrint").addEventListener("click", () => window.print());

  // --- Génération QR robuste ---
  // Colonnes : Prenom,Nom,Classe,Sexe,Distance,VMA
  const qrLines = rows
    .map((e) => [
      e.prenom,
      e.nom,
      e.classe,
      e.sexe,
      String(e.distance).replace(".", ","),
      String(e.vma).replace(".", ","),
    ].join(","))
    .filter((line) => !line.includes("NaN"));

  const qrPayload = qrLines.length ? qrLines.join("\n") : "AUCUNE_DONNEE";

  function makeQR() {
    const box = document.getElementById("qrcode");
    if (!box) return;
    box.innerHTML = "";
    try {
      new QRCode(box, {
        text: qrPayload,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      box.innerHTML = "<p style='color:red;padding:10px'>Erreur QR</p>";
    }
  }

  // Assure le chargement complet de la lib QRCode
  const initQR = () => {
    if (window.QRCode) {
      makeQR();
    } else {
      let tries = 0;
      const iv = setInterval(() => {
        if (window.QRCode) {
          clearInterval(iv);
          makeQR();
        } else if (tries++ > 30) {
          clearInterval(iv);
          const box = document.getElementById("qrcode");
          if (box) box.textContent = "Librairie QR non chargée.";
        }
      }, 100);
    }
  };

  window.addEventListener("load", initQR);
})();
