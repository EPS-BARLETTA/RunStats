// fraction.js — v2 robuste et pédagogique
// -------------------------------------------------------------
// Fonction appelée à la fin d’une course pour ajouter un quart / demi / trois-quarts de tour.
// Elle met à jour la distance, la vitesse et la VMA de l’élève.
// -------------------------------------------------------------
// Rappel :
// - eleve.distance : distance en mètres (déjà courue)
// - eleve.temps    : durée totale en secondes (ex : 360 = 6 minutes)
// - longueurTour   : distance d’un tour complet en mètres
// - Coeff VMA : 1.15 uniquement pour un test ≥ 5 minutes (≈ test de 6 min)

function ajouterFraction(eleve, longueurTour) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("partialDialog");
    const info   = document.getElementById("partialDialogInfo");

    if (!dialog || typeof dialog.showModal !== "function") {
      // Pas de boîte de dialogue -> pas de fraction
      return resolve(eleve);
    }

    // --- Affichage infos actuelles ---
    if (info) {
      const d = Math.round(Number(eleve.distance || 0));
      info.textContent = `${(eleve.prenom || "")} ${(eleve.nom || "")} — Distance : ${d} m`;
    }

    dialog.returnValue = "0";
    dialog.showModal();

    // --- Convertit une valeur de fraction (0.5 ou "1/2") en nombre ---
    const parseFractionValue = (val) => {
      if (val == null) return NaN;
      if (typeof val === "string" && val.includes("/")) {
        const parts = val.split("/");
        if (parts.length === 2) {
          const a = Number(parts[0]);
          const b = Number(parts[1]);
          if (isFinite(a) && isFinite(b) && b !== 0) return a / b;
        }
      }
      const n = parseFloat(val);
      return isFinite(n) ? n : NaN;
    };

    // --- Accepte uniquement 0.25 / 0.5 / 0.75 ---
    const clampToAllowed = (x) => {
      const allowed = [0.25, 0.5, 0.75];
      let best = null, bestDiff = Infinity;
      for (const a of allowed) {
        const diff = Math.abs(a - x);
        if (diff < bestDiff) { bestDiff = diff; best = a; }
      }
      return bestDiff <= 0.05 ? best : NaN;
    };

    const onClose = () => {
      dialog.removeEventListener("close", onClose);

      const raw = dialog.returnValue;
      let fraction = parseFractionValue(raw);
      fraction = clampToAllowed(fraction);

      if (!isFinite(fraction) || fraction <= 0) {
        return resolve(eleve); // aucune fraction ajoutée
      }

      // --- Calculs protégés ---
      const tour      = Number(longueurTour || 0);
      const distAvant = Number(eleve.distance || 0);
      const t         = Math.max(1, Number(eleve.temps || 0)); // secondes

      if (!isFinite(tour) || tour <= 0 || !isFinite(distAvant)) return resolve(eleve);

      const ajout   = tour * fraction;
      const newDist = Math.round(distAvant + ajout);
      const vit     = (newDist / t) * 3.6; // km/h

      // --- Coefficient VMA dynamique ---
      // Si test de 5 min ou plus → coeff 1.15, sinon 1.00
      const coeff = (t >= 300) ? 1.15 : 1.00;
      const vma   = vit * coeff;

      const maj = {
        ...eleve,
        distance: newDist,
        vitesse: Number.isFinite(vit) ? parseFloat(vit.toFixed(2)) : 0,
        vma:     Number.isFinite(vma) ? parseFloat(vma.toFixed(2)) : 0,
      };

      resolve(maj);
    };

    dialog.addEventListener("close", onClose, { once: true });
  });
}
