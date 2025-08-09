(function(){
  // Utilitaires
  function toNum(x){ const n = Number(String(x).replace(",", ".")); return isNaN(n)?NaN:n; }
  function r2(n){ return Math.round(n*100)/100; }

  // Récup des stats consolidées par course.js
  let stats = [];
  try { stats = JSON.parse(sessionStorage.getItem("stats")) || []; } catch(e){ stats = []; }

  // Garde-fous : si stats vide, tente de reconstruire depuis eleve1/eleve2 (au cas où on est venu direct)
  if (!stats || !stats.length) {
    const e1 = JSON.parse(sessionStorage.getItem("eleve1")||"{}");
    const e2 = JSON.parse(sessionStorage.getItem("eleve2")||"{}");
    const duree = toNum(sessionStorage.getItem("dureeCourse")) || 3;
    const fallback = [e1,e2].filter(x=>x && (x.nom||x.prenom));
    stats = fallback.map(e => ({
      prenom: e.prenom||"", nom: e.nom||"", classe: e.classe||"", sexe: e.sexe||"",
      distance: r2(toNum(e.distance)||0),
      duree: r2(duree),
      vitesse: r2(toNum(e.vitesse)||0),
      vma: r2(toNum(e.vma)||0)
    }));
  }

  // Nettoyage des objets (ordre & clés)
  const rows = (stats||[])
    .filter(e => (e && (e.nom||e.prenom)))
    .map(e => ({
      prenom: e.prenom||"", nom: e.nom||"", classe: e.classe||"", sexe: e.sexe||"",
      distance: r2(toNum(e.distance)||0),
      duree: r2(toNum(e.duree)|| (toNum(sessionStorage.getItem("dureeCourse"))||3)),
      vitesse: r2(toNum(e.vitesse)||0),
      vma: r2(toNum(e.vma)||0)
    }));

  // Affiche dans le tableau
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
  rows.forEach(e=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.prenom}</td>
      <td>${e.nom}</td>
      <td>${e.classe}</td>
      <td>${e.sexe}</td>
      <td>${e.distance}</td>
      <td>${e.duree}</td>
      <td>${e.vitesse}</td>
      <td>${e.vma}</td>
    `;
    tbody.appendChild(tr);
  });

  // CSV export (avec en-têtes)
  function toCSV(arr){
    const header = ["Prenom","Nom","Classe","Sexe","Distance","Duree","Vitesse","VMA"];
    const lines = [header.join(",")];
    arr.forEach(e=>{
      lines.push([
        e.prenom, e.nom, e.classe, e.sexe,
        String(e.distance).replace(".", ","),
        String(e.duree).replace(".", ","),
        String(e.vitesse).replace(".", ","),
        String(e.vma).replace(".", ","),
      ].join(","));
    });
    return lines.join("\n");
  }

  document.getElementById("btnCsv").addEventListener("click", ()=>{
    const csv = toCSV(rows);
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resultats_course.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 100);
  });

  document.getElementById("btnPrint").addEventListener("click", ()=> window.print());

  // QR code (format CSV sans en-têtes, 1 ligne par élève, pour ScanProf)
  // Colonnes : Prenom,Nom,Classe,Sexe,Distance,VMA
  const qrLines = rows.map(e => [
    e.prenom, e.nom, e.classe, e.sexe,
    String(e.distance).replace(".", ","),  // décimales FR si besoin
    String(e.vma).replace(".", ",")
  ].join(","));
  const qrPayload = qrLines.join("\n") || "AUCUNE_DONNEE";

  // Génère QR
  function makeQR(){
    const box = document.getElementById("qrcode");
    box.innerHTML = "";
    /* global QRCode */
    new QRCode(box, {
      text: qrPayload,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // Si la lib QR n'est pas encore chargée (defer), on retente un peu
  if (window.QRCode) {
    makeQR();
  } else {
    let tries = 0;
    const iv = setInterval(()=>{
      if (window.QRCode || tries>30){ clearInterval(iv); if (window.QRCode) makeQR(); }
      tries++;
    }, 100);
  }
})();
