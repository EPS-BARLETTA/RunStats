function ajouterFraction(eleve, longueurTour) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("partialDialog");
    const info = document.getElementById("partialDialogInfo");

    // Affiche les infos actuelles de l'élève
    info.textContent = `${eleve.prenom} ${eleve.nom} - Distance : ${eleve.distance} m`;

    dialog.showModal();

    dialog.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      dialog.close();
    };

    dialog.addEventListener("close", () => {
      const fraction = parseFloat(dialog.returnValue);
      if (!isNaN(fraction) && fraction > 0) {
        const ajout = longueurTour * fraction;
        eleve.distance = Math.round(eleve.distance + ajout);
        eleve.vitesse = parseFloat(((eleve.distance / 1000) / (eleve.temps / 60)).toFixed(2));
        eleve.vma = parseFloat((eleve.vitesse * 1.15).toFixed(2));
      }
      resolve(eleve);
    }, { once: true });
  });
}
