// fraction.js — ajout de fraction de tour à la fin de course
function ajouterFraction(eleve, longueurTour) {
  return new Promise((resolve) => {
    if (!isFinite(longueurTour) || longueurTour <= 0) {
      try {
        longueurTour = parseFloat(sessionStorage.getItem('longueurTour')) || 0;
      } catch (e) {
        longueurTour = 0;
      }
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.35)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "18px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
    box.style.textAlign = "center";

    const title = document.createElement("div");
    title.textContent = "Ajouter une fraction de tour";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "10px";

    const subtitle = document.createElement("div");
    subtitle.textContent = `(Tour = ${Math.round(longueurTour)} m)`;
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
      b.style.padding = "10px 14px";
      b.style.borderRadius = "8px";
      b.style.border = "1px solid #ddd";
      b.style.background = "#f6f7fb";
      b.style.cursor = "pointer";
      b.addEventListener("click", () => {
        eleve.distance += longueurTour * frac;
        const temps_s = eleve.temps || 0;
        if (temps_s > 0) {
          const vitesse = (eleve.distance / 1000) / (temps_s / 3600);
          eleve.vitesse = Math.round(vitesse * 100) / 100;
          eleve.vma = Math.round(eleve.vitesse * 1.15 * 100) / 100;
        }
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
}
