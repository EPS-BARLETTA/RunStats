// fraction.js — fenêtre d'ajout 1/4, 1/2, 3/4 de tour (sobre et intégrée)

// Calculs utiles
function kmh(distance_m, time_s) {
  if (!isFinite(distance_m) || !isFinite(time_s) || time_s <= 0) return 0;
  return (distance_m / time_s) * 3.6;
}

function kmhSmart(distance_m, time_val) {
  if (!isFinite(distance_m) || !isFinite(time_val) || time_val <= 0) return 0;
  const time_s = (time_val <= 20) ? time_val * 60 : time_val;
  return kmh(distance_m, time_s);
}

function vmaEquiv6min(distance_m, time_s) {
  if (!isFinite(distance_m) || !isFinite(time_s) || time_s <= 0) return 0;
  const tMin = Math.max(0.5, time_s / 60);
  const v = kmh(distance_m, time_s);
  const a = 0.06;
  const v6 = v * Math.pow(tMin / 6, a);
  return Math.round(v6 * 100) / 100;
}

function vmaEquiv6minSmart(distance_m, time_val) {
  if (!isFinite(distance_m) || !isFinite(time_val) || time_val <= 0) return 0;
  const time_s = (time_val <= 20) ? time_val * 60 : time_val;
  return vmaEquiv6min(distance_m, time_s);
}

// Fonction globale
window.ajouterFraction = function (eleve, longueurTour) {
  if (!isFinite(longueurTour) || longueurTour <= 0) {
    try {
      longueurTour = parseFloat(sessionStorage.getItem('longueurTour')) 
                  || parseFloat(sessionStorage.getItem('lapLength')) || 0;
    } catch (e) { longueurTour = 0; }
  }

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "18px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    box.style.minWidth = "260px";
    box.style.textAlign = "center";

    const title = document.createElement("h3");
    title.textContent = "Ajouter une fraction de tour";
    title.style.marginBottom = "10px";

    const info = document.createElement("p");
    info.textContent = `(Longueur du tour : ${Math.round(longueurTour)} m)`;
    info.style.fontSize = "13px";
    info.style.opacity = "0.7";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.justifyContent = "center";
    row.style.marginTop = "12px";

    const mkBtn = (label, frac) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.fraction = frac;
      b.style.padding = "10px 14px";
      b.style.border = "none";
      b.style.borderRadius = "8px";
      b.style.background = "#f0f0f0";
      b.style.cursor = "pointer";
      b.addEventListener("click", () => {
        const ajout = longueurTour * frac;
        eleve.distance += ajout;
        eleve.vitesse = kmhSmart(eleve.distance, eleve.temps);
        eleve.vma = vmaEquiv6minSmart(eleve.distance, eleve.temps);
        document.body.removeChild(overlay);
        resolve(eleve);
      });
      return b;
    };

    const cancel = document.createElement("button");
    cancel.textContent = "Aucun ajout";
    cancel.style.marginTop = "14px";
    cancel.style.padding = "8px 12px";
    cancel.style.border = "none";
    cancel.style.borderRadius = "6px";
    cancel.style.background = "#ddd";
    cancel.style.cursor = "pointer";
    cancel.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(eleve);
    });

    row.appendChild(mkBtn("¼ tour", 0.25));
    row.appendChild(mkBtn("½ tour", 0.5));
    row.appendChild(mkBtn("¾ tour", 0.75));

    box.appendChild(title);
    box.appendChild(info);
    box.appendChild(row);
    box.appendChild(cancel);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
};
