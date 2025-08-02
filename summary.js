// Récupérer les données des deux élèves depuis localStorage
document.addEventListener('DOMContentLoaded', () => {
    const student1 = JSON.parse(localStorage.getItem('student1'));
    const student2 = JSON.parse(localStorage.getItem('student2'));

    if (!student1 || !student2) {
        alert("Données manquantes, retour à l'accueil.");
        window.location.href = 'eleve.html';
        return;
    }

    // Afficher les infos sur la page
    displayStudentData('student1-data', student1);
    displayStudentData('student2-data', student2);

    // Bouton télécharger CSV
    document.getElementById('downloadCSV').addEventListener('click', () => {
        downloadCSV(student1, student2);
    });

    // Bouton générer QR Code
    document.getElementById('generateQR').addEventListener('click', () => {
        generateQRCode(student1, student2);
    });
});

// Fonction pour afficher les infos dans la page
function displayStudentData(containerId, student) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <h3>${student.nom} ${student.prenom} (${student.classe})</h3>
        <p>Sexe : ${student.sexe}</p>
        <p>Distance totale : ${student.distance.toFixed(2)} m</p>
        <p>Durée : ${student.duree} min</p>
        <p>Vitesse moyenne : ${student.vitesseMoyenne.toFixed(2)} km/h</p>
        <p>VMA estimée : ${student.vmaEstimee.toFixed(2)} km/h</p>
    `;
}

// Fonction téléchargement CSV
function downloadCSV(student1, student2) {
    const rows = [
        ["Nom", "Prénom", "Classe", "Sexe", "Distance (m)", "Durée (min)", "Vitesse Moyenne (km/h)", "VMA estimée (km/h)"],
        [student1.nom, student1.prenom, student1.classe, student1.sexe, student1.distance.toFixed(2), student1.duree, student1.vitesseMoyenne.toFixed(2), student1.vmaEstimee.toFixed(2)],
        [student2.nom, student2.prenom, student2.classe, student2.sexe, student2.distance.toFixed(2), student2.duree, student2.vitesseMoyenne.toFixed(2), student2.vmaEstimee.toFixed(2)]
    ];

    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resultats_RunStats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fonction génération QR Code
function generateQRCode(student1, student2) {
    const data = `
        Élève 1: ${student1.nom} ${student1.prenom} (${student1.classe}) - Distance: ${student1.distance.toFixed(2)}m
        Vitesse: ${student1.vitesseMoyenne.toFixed(2)} km/h - VMA: ${student1.vmaEstimee.toFixed(2)} km/h

        Élève 2: ${student2.nom} ${student2.prenom} (${student2.classe}) - Distance: ${student2.distance.toFixed(2)}m
        Vitesse: ${student2.vitesseMoyenne.toFixed(2)} km/h - VMA: ${student2.vmaEstimee.toFixed(2)} km/h
    `;

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ""; // Réinitialiser

    const qr = new QRCode(qrContainer, {
        text: data,
        width: 200,
        height: 200
    });
}
