// fraction.js — complet
// Affiche un <dialog> avec 1/4, 1/2, 3/4 et met à jour l'objet élève.
// Hypothèses :
// - eleve.distance en mètres
// - eleve.temps en secondes (durée totale de la course pour cet élève)
// - longueurTour en mètres
// - VMA = vitesse * 1.15 (adapte si besoin)

function ajouterFraction(eleve, longueurTour) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("partialDialog");
    const info = document.getElementById("partialDialogInfo");

    // Si pas de dialog (fallback), on renvoie l'élève tel quel
    if (!dialog || typeof dialog.showModal !== "function") {
      return resolve(eleve);
    }

    // Affiche les infos actuelles de l'élève
    if (info) {
      const d = Math.round(Number(eleve.distance || 0));
      info.textContent = `${(eleve.prenom || "")} ${(eleve.nom || "")} — Distance : ${d} m`;
    }

    // Par sécurité : si fermeture par ESC ou clic extérieur → "0" (pas d'ajout)
    dialog.returnValue = "0";
    dialog.showModal();

    // IMPORTANT : ne PAS empêcher le submit du <form method="dialog">
    // Laisser le navigateur gérer pour que dialog.returnValue = value du bouton cliqué.

    // Au moment de la fermeture, on lit la fraction choisie
    const onClose = () => {
      dialog.removeEventListener("close", onClose);

      const fraction = parseFloat(dialog.returnValue);
      if (!isFinite(fraction) || fraction <= 0) {
        // Aucun ajout → on renvoie l'élève inchangé
        return resolve(eleve);
      }

      const tour = Number(longueurTour || 0);
      const distAvant = Number(eleve.distance || 0);
      const ajout = tour * fraction;
      const newDist = Math.round(distAvant + ajout);

      // Recalculs (temps en secondes)
      const t = Math.max(1, Number(eleve.temps || 0)); // évite division par zéro
      const vit = (newDist / t) * 3.6; // km/h
      const vma = vit * 1.15;

      const maj = {
        ...eleve,
        distance: newDist,
        vitesse: parseFloat(vit.toFixed(2)),
        vma: parseFloat(vma.toFixed(2)),
      };

      resolve(maj);
    };

    dialog.addEventListener("close", onClose, { once: true });
  });
}
