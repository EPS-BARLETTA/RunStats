// Récupération des données stockées après les courses
const summaryData = JSON.parse(localStorage.getItem("courseData")) || [];

// Sélection des éléments
const resultsTableBody = document.querySelector("#resultsTableBody");
const downloadCSVBtn = document.querySelector("#downloadCSVBtn");
const downloadQRBtn = document.querySelector("#downloadQRBtn");
const qrContainer = document.querySelector("#qrcode");

// Affiche les résultats dans le tableau
function displayResults() {
    resultsTableBody.innerHTML = "";

    summaryData.forEach((eleve, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${eleve.nom}</td>
            <td>${eleve.prenom}</td>
            <td>${eleve.classe}</td>
            <td>${eleve.sexe}</td>
            <td>${eleve.distance.toFixed(2)} m</td>
            <td>${eleve.vitesse.toFixed(2)} km/h</td>
            <td>${eleve.vma ? eleve.vma + " km/h" : "—"}</td>
        `;

        resultsTableBody.appendChild(tr);
    });
}

// Génération CSV
function generateCSV() {
    let csvContent = "Nom;Prénom;Classe;Sexe;Distance (m);Vitesse (km/h);VMA (km/h)\n";

    summaryData.forEach(eleve => {
        csvContent += `${eleve.nom};${eleve.prenom};${eleve.classe};${eleve.sexe};${eleve.distance.toFixed(2)};${eleve.vitesse.toFixed(2)};${eleve.vma || ""}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "resultats_courses.csv");
    link.click();
}

// Génération QR Code (encodage JSON)
function generateQRCode() {
    qrContainer.innerHTML = ""; // Nettoyer si déjà présent

    const qrData = JSON.stringify(summaryData);

    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Écouteurs
downloadCSVBtn.addEventListener("click", generateCSV);
downloadQRBtn.addEventListener("click", generateQRCode);

// Initialisation
displayResults();
