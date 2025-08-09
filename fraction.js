// fraction.js — Ajout d'un tour partiel simple

window.ajouterFraction = function (eleve, longueurTour) {
    return new Promise((resolve) => {
        // Création de l'overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.35)";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";

        // Boîte de dialogue
        const box = document.createElement("div");
        box.style.background = "#fff";
        box.style.padding = "16px";
        box.style.borderRadius = "8px";
        box.style.minWidth = "260px";
        box.style.textAlign = "center";

        const title = document.createElement("div");
        title.textContent = "Ajouter un tour partiel ?";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "8px";

        const info = document.createElement("div");
        info.textContent = `(longueur du tour = ${Math.round(longueurTour)} m)`;
        info.style.fontSize = "12px";
        info.style.opacity = "0.7";
        info.style.marginBottom = "12px";

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.justifyContent = "center";
        row.style.flexWrap = "wrap";

        const mkBtn = (label, frac) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.style.padding = "8px 12px";
            b.style.borderRadius = "6px";
            b.style.border = "1px solid #ddd";
            b.style.background = "#f6f7fb";
            b.style.cursor = "pointer";
            b.addEventListener("click", () => {
                eleve.distance += longueurTour * frac;
                document.body.removeChild(overlay);
                resolve(eleve);
            });
            return b;
        };

        const cancel = document.createElement("button");
        cancel.textContent = "Aucun";
        cancel.style.padding = "8px 12px";
        cancel.style.borderRadius = "6px";
        cancel.style.border = "1px solid #ddd";
        cancel.style.background = "#fff";
        cancel.style.cursor = "pointer";
        cancel.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(eleve);
        });

        row.appendChild(mkBtn("+ 1/4", 0.25));
        row.appendChild(mkBtn("+ 1/2", 0.5));
        row.appendChild(mkBtn("+ 3/4", 0.75));
        row.appendChild(cancel);

        box.appendChild(title);
        box.appendChild(info);
        box.appendChild(row);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
};
