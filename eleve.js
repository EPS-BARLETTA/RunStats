let courseData = {
    duree: 0,
    distanceTour: 0,
    vma: null,
    tours: 0,
    tempsRestant: 0,
    timerInterval: null
};

function startCourse() {
    courseData.duree = parseInt(document.getElementById("duree").value) * 60;
    courseData.distanceTour = parseInt(document.getElementById("distanceTour").value);
    courseData.vma = parseFloat(document.getElementById("vma").value) || null;

    if (isNaN(courseData.duree) || isNaN(courseData.distanceTour) || courseData.duree <= 0 || courseData.distanceTour <= 0) {
        alert("Veuillez entrer une durée et une distance valides.");
        return;
    }

    document.querySelector(".eleves-container").classList.add("hidden");
    document.querySelector(".bloc-param").classList.add("hidden");
    document.querySelector(".boutons").classList.add("hidden");
    document.getElementById("courseSection").classList.remove("hidden");

    courseData.tempsRestant = courseData.duree;
    updateTimer();
    courseData.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const timer = document.getElementById("timer");
    const minutes = Math.floor(courseData.tempsRestant / 60);
    const secondes = courseData.tempsRestant % 60;
    timer.textContent = `${minutes}:${secondes < 10 ? "0" : ""}${secondes}`;

    if (courseData.tempsRestant <= 10) {
        timer.style.color = "red";
        timer.style.fontWeight = "bold";
        timer.style.animation = "blink 1s infinite";
    }

    if (courseData.tempsRestant <= 0) {
        clearInterval(courseData.timerInterval);
        document.getElementById("courseSection").classList.add("hidden");
        document.getElementById("resultSection").classList.remove("hidden");
    }

    courseData.tempsRestant--;
}

function addTour() {
    courseData.tours++;
    const distanceParcourue = courseData.tours * courseData.distanceTour;
    const vitesse = (distanceParcourue / (courseData.duree - courseData.tempsRestant)) * 3.6 || 0; // en km/h
    const vmaEstimee = vitesse.toFixed(2);

    document.getElementById("infosCourse").innerHTML = `
        <p>Tours : ${courseData.tours}</p>
        <p>Distance parcourue : ${distanceParcourue} m</p>
        <p>Vitesse moyenne : ${vitesse.toFixed(2)} km/h</p>
        <p>VMA estimée : ${vmaEstimee} km/h</p>
    `;
}

function resetData() {
    location.reload();
}

function generateQR() {
    const eleve1 = {
        nom: document.getElementById("nom1").value,
        prenom: document.getElementById("prenom1").value
    };
    const eleve2 = {
        nom: document.getElementById("nom2").value,
        prenom: document.getElementById("prenom2").value
    };

    const totalDistance = courseData.tours * courseData.distanceTour;

    const data = {
        eleve1,
        eleve2,
        totalDistance,
        vmaEstimee: (totalDistance / (courseData.duree / 3.6)).toFixed(2)
    };

    const qr = new QRious({
        element: document.getElementById("qrcode"),
        size: 200,
        value: JSON.stringify(data)
    });
}

function exportCSV() {
    const eleve1Nom = document.getElementById("nom1").value;
    const eleve1Prenom = document.getElementById("prenom1").value;
    const eleve2Nom = document.getElementById("nom2").value;
    const eleve2Prenom = document.getElementById("prenom2").value;
    const totalDistance = courseData.tours * courseData.distanceTour;
    const vmaEstimee = (totalDistance / (courseData.duree / 3.6)).toFixed(2);

    const csvContent = `Nom;Prénom;Distance (m);VMA estimée (km/h)\n${eleve1Nom};${eleve1Prenom};${totalDistance};${vmaEstimee}\n${eleve2Nom};${eleve2Prenom};${totalDistance};${vmaEstimee}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "resultats.csv");
    link.click();
}
