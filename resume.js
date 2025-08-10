// resume.js
document.addEventListener("DOMContentLoaded", () => {
    const stats = JSON.parse(sessionStorage.getItem("stats") || "[]");
    const tableBody = document.querySelector("#results tbody");
    const qrContainer = document.getElementById("qrcode");
    let modeProf = false;

    // Création du tableau
    function renderTable() {
        tableBody.innerHTML = "";
        stats.forEach((eleve, index) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${eleve.nom}</td>
                <td>${eleve.prenom}</td>
                <td>${eleve.classe}</td>
                <td>${eleve.sexe}</td>
                <td>
                    ${modeProf
                        ? `<input type="number" value="${eleve.distance}" min="0" style="width:80px" data-index="${index}" class="distance-input">`
                        : eleve.distance
                    }
                </td>
                <td>${eleve.vitesse.toFixed(2)}</td>
                <td>${eleve.vma.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });

        if (modeProf) {
            document.querySelectorAll(".distance-input").forEach(input => {
                input.addEventListener("input", (e) => {
                    const i = e.target.dataset.index;
                    const nouvelleDistance = parseFloat(e.target.value) || 0;
                    stats[i].distance = nouvelleDistance;
                    recalculerVitesseVMA(stats[i]);
                    renderTable();
                    genererQR();
                });
            });
        }
    }

    function recalculerVitesseVMA(eleve) {
        const duree = parseFloat(sessionStorage.getItem("dureeCourse")) || 0;
        const vitesse = (eleve.distance / 1000) / (duree / 60);
        eleve.vitesse = vitesse;
        eleve.vma = vitesse * 1.15;
    }

    // Génération QR code
    function genererQR() {
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
            text: JSON.stringify(stats),
            width: 180,
            height: 180
        });
    }

    // Export CSV
    document.getElementById("exportCSV").addEventListener("click", () => {
        let csvContent = "Nom;Prénom;Classe;Sexe;Distance;Vitesse;VMA\n";
        stats.forEach(eleve => {
            csvContent += `${eleve.nom};${eleve.prenom};${eleve.classe};${eleve.sexe};${eleve.distance};${eleve.vitesse.toFixed(2)};${eleve.vma.toFixed(2)}\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "resultats.csv";
        link.click();
    });

    // Bouton Mode Prof
    document.getElementById("modeProf").addEventListener("click", () => {
        const pin = prompt("Entrez le code PIN :");
        if (pin === "57") {
            modeProf = !modeProf;
            renderTable();
        } else {
            alert("Code incorrect");
        }
    });

    // Initialisation
    renderTable();
    genererQR();
});
