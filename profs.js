// profs.js
// Gestion du scan QR code et affichage des résultats dans le tableau

let scanner;
let resultats = [];

// Initialisation du scanner
document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    const videoPreview = document.getElementById("preview");

    // Lancer ou arrêter le scan
    scanBtn.addEventListener("click", () => {
        if (!scanner) {
            initScanner(videoPreview);
        } else {
            stopScanner();
        }
    });

    // Bouton trier
    document.getElementById("trierBtn").addEventListener("click", () => {
        const critere = document.getElementById("triSelect").value;
        trierResultats(critere);
        afficherResultats();
    });
});

// Initialiser le scanner
function initScanner(videoElement) {
    scanner = new Instascan.Scanner({ video: videoElement });

    scanner.addListener("scan", (contenu) => {
        try {
            const data = JSON.parse(contenu);

            // Vérifie que c'est bien un tableau de deux élèves
            if (Array.isArray(data) && data.length === 2) {
                // Ajoute chaque élève individuellement dans le tableau global
                data.forEach(eleve => {
                    resultats.push(eleve);
                });
                afficherResultats();
                alert("Données ajoutées !");
            } else {
                alert("QR Code invalide.");
            }
        } catch (e) {
            alert("Erreur lors de la lecture du QR Code.");
        }
    });

    Instascan.Camera.getCameras().then(cameras => {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
            document.getElementById("scanBtn").textContent = "Arrêter Scan";
        } else {
            alert("Aucune caméra trouvée.");
        }
    }).catch(err => console.error(err));
}

// Arrêter le scanner
function stopScanner() {
    if (scanner) {
        scanner.stop();
        scanner = null;
        document.getElementById("scanBtn").textContent = "Scanner QR Code";
    }
}

// Afficher les résultats dans le tableau
function afficherResultats() {
    const tbody = document.querySelector("#resultatsTable tbody");
    tbody.innerHTML = "";

    resultats.forEach(eleve => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${eleve.nom}</td>
            <td>${eleve.prenom}</td>
            <td>${eleve.classe}</td>
            <td>${eleve.sexe}</td>
            <td>${eleve.tours}</td>
            <td>${eleve.distance}</td>
            <td>${eleve.vma}</td>
        `;

        tbody.appendChild(row);
    });
}

// Fonction de tri
function trierResultats(critere) {
    resultats.sort((a, b) => {
        if (critere === "distance" || critere === "vma") {
            return parseFloat(b[critere]) - parseFloat(a[critere]);
        } else {
            return a[critere].localeCompare(b[critere]);
        }
    });
}
