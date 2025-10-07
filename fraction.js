// fraction.js — robuste (accepte 0.5 ou "1/2", clamp, sécurités)
function ajouterFraction(eleve, longueurTour) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("partialDialog");
    const info   = document.getElementById("partialDialogInfo");

    if (!dialog || typeof dialog.showModal !== "function") {
      // Pas de dialog => aucune fraction, on renvoie tel quel
      return resolve(eleve);
    }

    // Affiche l'info élève
    if (info) {
      const d = Math.round(Number(eleve.distance || 0));
      info.textContent = `${(eleve.prenom || "")} ${(eleve.nom || "")} — Distance : ${d} m`;
    }

    // Valeur par défaut si la boîte est fermée sans choix
    dialog.returnValue = "0";
    dialog.showModal();

    const parseFractionValue = (val) => {
      if (val == null) return NaN;
      // Accepte "0.5" ou "1/2"
      if (typeof val === "string" && val.includes("/")) {
        const parts = val.split("/");
        if (parts.length === 2) {
          const a = Number(parts[0]);
          const b = Number(parts[1]);
          if (isFinite(a) && isFinite(b) && b !== 0) {
            return a / b;
          }
        }
      }
      const n = parseFloat(val);
      return isFinite(n) ? n : NaN;
    };

    const clampToAllowed = (x) => {
      // Autorise seulement 0.25, 0.5, 0.75 (évite 0.3 ou 1 par erreur)
      const allowed = [0.25, 0.5, 0.75];
      // Cherche la plus proche valeur autorisée si x est "presque" correct
      let best = null, bestDiff = Infinity;
      for (const a of allowed) {
        const diff = Math.abs(a - x);
        if (diff < bestDiff) { bestDiff = diff; best = a; }
      }
      // Tolérance 0.05 pour corriger 0.49999 / 0.251 etc.
      return bestDiff <= 0.05 ? best : NaN;
    };

    const onClose = () => {
      dialog.removeEventListener("close", onClose);

      const raw = dialog.returnValue;
      let fraction = parseFractionValue(raw);
      fraction = clampToAllowed(fraction);

      if (!isFinite(fraction) || fraction <= 0) {
        // Aucun ajout => renvoie l'élève inchangé
        return resolve(eleve);
      }

      const tour      = Number(longueurTour || 0);
      const distAvant = Number(eleve.distance || 0);
      const t         = Math.max(1, Number(eleve.temps || 0)); // secondes

      // Sécurités
      if (!isFinite(tour) || tour <= 0)   return resolve(eleve);
      if (!isFinite(distAvant) || distAvant < 0) return resolve(eleve);
      if (!isFinite(t)) return resolve(eleve);

      const ajout   = tour * fraction;                  // mètres
      const newDist = Math.round(distAvant + ajout);    // mètres (entier)
      const vit     = (newDist / t) * 3.6;              // km/h
      const vma     = vit * 1.15;                       // 6' => coeff 1.15

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
