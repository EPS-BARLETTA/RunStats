// resume.js — affiche élèves côte à côte (Élève 1 bleu clair / Élève 2 vert clair),
// génère le QR JSON (primordial) et export CSV.

window.onload = function () {
  const eleve1 = safeParse(sessionStorage.getItem("eleve1")) || {};
  const eleve2 = safeParse(sessionStorage.getItem("eleve2")) || {};
  // stats a normalement été rempli et ajusté (fractions) dans course.js
  let stats = safeParse(sessionStorage.getItem("stats")) || [];

  // garde-fous : si pas de stats, on reconstruit un minimum depuis eleve1/eleve2
  if (!Array.isArray(stats) || stats.length < 2) {
    stats = [
      makeRowFromEleve(eleve1),
      makeRowFromEleve(eleve2),
    ];
  }

  // Affichage cartes
  renderCard("infoA", stats[0]);
  renderCard("infoB", stats[1]);

  // QR code (payload = array de 2 élèves)
  const qrData = JSON.stringify(stats);
  const qrWrap = document.getElementById("qrcode");
  qrWrap.innerHTML = "";
  QRCode.toCanvas(document.createElement("canvas"), qrData, { width: 220 }, function (err, canvas) {
    if (!err) qrWrap.appendChild(canvas);
  });

  // CSV
  document.getElementById("downloadCSV").onclick = function () {
    const headers = ["nom", "prenom", "classe", "sexe", "distance", "vitesse", "vma"];
    const rows = stats.map(e => headers.map(h => normalizeCell(e[h])));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadFile("donnees_runstats.csv", csv, "text/csv;charset=utf-8;");
  };

  // Utils
  function renderCard(containerId, e) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = [
      row("Nom", `${e.nom || ""} ${e.prenom || ""}`.trim()),
      row("Classe / Sexe", `${e.classe || ""} / ${e.sexe || ""}`.trim()),
      row("Distance", fmtMeters(e.distance)),
      row("Vitesse", fmtKmh(e.vitesse)),
      row("VMA", fmtKmh(e.vma))
    ].join("");
  }

  function row(label, value) {
    return `<p><strong>${escapeHtml(label)} :</strong> ${escapeHtml(String(value))}</p>`;
  }

  function fmtMeters(v) {
    const n = toNum(v);
    return isFinite(n) ? `${round2(n)} m` : "—";
  }
  function fmtKmh(v) {
    const n = toNum(v);
    return isFinite(n) ? `${round2(n)} km/h` : "—";
  }

  function round2(x) { return Math.round(Number(x) * 100) / 100; }
  function toNum(x){ const n = Number(x); return isNaN(n) ? NaN : n; }
  function normalizeCell(x){
    if (x == null) return "";
    const n = Number(x);
    return isNaN(n) ? String(x) : String(round2(n));
  }

  function downloadFile(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }, 500);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function safeParse(t) { try { return JSON.parse(t); } catch (e) { return null; } }
  function makeRowFromEleve(e) {
    return {
      nom: e?.nom || "",
      prenom: e?.prenom || "",
      classe: e?.classe || "",
      sexe: e?.sexe || "",
      distance: toNum(e?.distance) || 0,
      vitesse: toNum(e?.vitesse) || 0,
      vma: toNum(e?.vma) || 0
    };
  }
};
