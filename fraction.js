// fraction.js
// Permet d'ajouter 1/4, 1/2 ou 3/4 de tour à un élève et recalculer les valeurs

function ajouterFraction(eleve, longueurTour) {
    return new Promise((resolve) => {
        // Création de la fenêtre de sélection
        const choix = document.createElement("div");
        choix.style.position = "fixed";
        choix.style.top = "50%";
        choix.style.left = "50%";
        choix.style.transform = "translate(-50%, -50%)";
        choix.style.background = "white";
        choix.style.padding = "20px";
        choix.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        choix.style.zIndex = "9999";
        choix.style.textAlign = "center";
        choix.style.borderRadius = "10px";
        choix.innerHTML = `
            <h3>Ajouter des fractions de tour pour ${eleve.prenom} ${eleve.nom}</h3>
            <p>Sélectionne une option :</p>
            <button data-fraction="0">0</button>
            <button data-fraction="0.25">+1/4</button>
            <button data-fraction="0.5">+1/2</button>
            <button data-fraction="0.75">+3/4</button>
        `;

        document.body.appendChild(choix);

        // Gestion du clic
        choix.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                const fraction = parseFloat(btn.dataset.fraction);
                const ajoutDistance = longueurTour * fraction;
                eleve.distance += ajoutDistance;
                eleve.vitesse = (eleve.distance / eleve.temps) * 60;
                eleve.vma = eleve.vitesse * 1.15;

                document.body.removeChild(choix);
                resolve(eleve);
            });
        });
    });
}

