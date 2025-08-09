// fraction.js — fenêtre d'ajout 1/4, 1/2, 3/4 de tour

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

// Fonction globale appelée par course.js
window.ajouterFraction = function (eleve, longueurTour) {
  if (!isFinite(longueurTour) || longueurTour <= 0) {
    try {
      longueurTour = parseFloat(sessionStorage.getItem('longueurTour')) || 0;
    } catch (e) { longueurTour = 0; }
  }

  return new Promise((resolve) => {
    // overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.35)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    // modal
    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "18px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
    box.style.minWidth = "280px";
    box.style.maxWidth = "90vw";
    box.style.textAlign = "center";

    const title = document.createElement("div");
    title.textContent = "Ajouter une fraction de tour";
    title.style.fontWeight = "600";
    title.style.marginBottom = "10px";

    const subtitle = document.createElement("div");
    subtitle.textContent = `(longueur du tour = ${Math.round(longueurTour)} m)`;
    subtitle.style.fontSize = "12px";
    subtitle.style.opacity = "0.7";
    subtitle.style.marginBottom = "12px";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.justifyContent = "center";
    row.style.marginBottom = "12px";

    const mkBtn = (label, frac) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.fraction = String(frac);
      b.style.padding = "10px 12px";
      b.style.borderRadius = "10px";
      b.style.border = "1px solid #ddd";
      b.style.background = "#f6f7fb";
      b.style.cursor = "pointer";
      b.style.fontSize = "16px";
      b.addEventListener("click", () => {
        const fraction = parseFloat(b.dataset.fraction);
        const ajoutDistance = longueurTour * fraction;
        eleve.distance += ajoutDistance;
        // Mise à jour vitesse et VMA
        eleve.vitesse = kmhSmart(eleve.distance, eleve.temps || duree * 60);
        eleve.vma = vmaEquiv6minSmart(eleve.distance, eleve.temps || duree * 60);
        // fermer
        document.body.removeChild(overlay);
        resolve(eleve);
      });
      return b;
    };

    const cancel = document.createElement("button");
    cancel.textContent = "Sans ajout";
    cancel.style.padding = "8px 10px";
    cancel.style.borderRadius = "8px";
    cancel.style.border = "1px solid #ddd";
    cancel.style.background = "#fff";
    cancel.style.cursor = "pointer";
    cancel.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(eleve);
    });

    row.appendChild(mkBtn("¼ tour", 0.25));
    row.appendChild(mkBtn("½ tour", 0.5));
    row.appendChild(mkBtn("¾ tour", 0.75));

    box.appendChild(title);
    box.appendChild(subtitle);
    box.appendChild(row);
    box.appendChild(cancel);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
};
