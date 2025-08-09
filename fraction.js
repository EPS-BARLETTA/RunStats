// fraction.js — fenêtre d'ajout 1/4, 1/2, 3/4 de tour (sobre)

function kmh(distance_m, time_s) {
  return (time_s > 0) ? (distance_m / time_s) * 3.6 : 0;
}

function kmhSmart(distance_m, time_val) {
  const time_s = (time_val <= 20) ? time_val * 60 : time_val;
  return kmh(distance_m, time_s);
}

function vmaEquiv6min(distance_m, time_s) {
  if (time_s <= 0) return 0;
  const v = kmh(distance_m, time_s);
  const a = 0.06;
  const v6 = v * Math.pow(Math.max(0.5, time_s / 60) / 6, a);
  return Math.round(v6 * 100) / 100;
}

function vmaEquiv6minSmart(distance_m, time_val) {
  const time_s = (time_val <= 20) ? time_val * 60 : time_val;
  return vmaEquiv6min(distance_m, time_s);
}

window.ajouterFraction = function (eleve, longueurTour) {
  if (!longueurTour || longueurTour <= 0) {
    longueurTour = parseFloat(sessionStorage.getItem('longueurTour')) || 0;
  }

  return new Promise((resolve) => {
    // Overlay sombre
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.35)",
      zIndex: "9999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });

    // Boîte centrale
    const box = document.createElement("div");
    Object.assign(box.style, {
      background: "#fff",
      padding: "18px",
      borderRadius: "12px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      minWidth: "280px",
      textAlign: "center"
    });

    const title = document.createElement("div");
    title.textContent = "Ajouter une fraction de tour";
    title.style.fontWeight = "600";
    title.style.marginBottom = "10px";

    const subtitle = document.createElement("div");
    subtitle.textContent = `(longueur du tour = ${Math.round(longueurTour)} m)`;
    Object.assign(subtitle.style, {
      fontSize: "12px",
      opacity: "0.7",
      marginBottom: "12px"
    });

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginBottom: "12px"
    });

    const mkBtn = (label, frac) => {
      const b = document.createElement("button");
      b.textContent = label;
      Object.assign(b.style, {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#f6f7fb",
        cursor: "pointer",
        fontSize: "16px"
      });
      b.onclick = () => {
        const ajoutDistance = longueurTour * frac;
        eleve.distance += ajoutDistance;
        eleve.vitesse = kmhSmart(eleve.distance, eleve.temps);
        eleve.vma = vmaEquiv6minSmart(eleve.distance, eleve.temps);
        document.body.removeChild(overlay);
        resolve(eleve);
      };
      return b;
    };

    const cancel = document.createElement("button");
    cancel.textContent = "Sans ajout";
    Object.assign(cancel.style, {
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      background: "#fff",
      cursor: "pointer"
    });
    cancel.onclick = () => {
      document.body.removeChild(overlay);
      resolve(eleve);
    };

    row.append(
      mkBtn("¼ tour", 0.25),
      mkBtn("½ tour", 0.5),
      mkBtn("¾ tour", 0.75)
    );

    box.append(title, subtitle, row, cancel);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
};
