// ===================== VARIABLES GLOBALES =====================
let currentRunner = 1;
let laps = { 1: [], 2: [] };
let startTime = null;
let timerInterval = null;
let durationSelected = 0;
let runnerData = {};

// ===================== UTILITAIRES =====================
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function calculateAverageSpeed(distance, duration) {
    // Vitesse moyenne en km/h : distance (m) / durée (s) * 3.6
    return ((distance / duration) * 3.6).toFixed(2);
}

function calculateVMA(distance, duration) {
    // VMA = vitesse moyenne globale
    return calculateAverageSpeed(distance, duration);
}

// ===================== GESTION COURSE =====================
function startRace() {
    const prenom = document.getElementById(`prenom${currentRunner}`).value;
    const nom = document.getElementById(`nom${currentRunner}`).value;
    const sexe = document.getElementById(`sexe${currentRunner}`).value;
    const piste = parseFloat(document.getElementById(`piste${currentRunner}`).value) || 0;
    const duree = parseFloat(document.getElementById(`duree${currentRunner}`).value) || 0;

    if (!prenom || !nom || sexe === "choix" || piste <= 0 || duree <= 0) {
        alert("Veuillez remplir tous les champs correctement pour démarrer la course.");
        return;
    }

    runnerData[currentRunner] = {
        prenom,
        nom,
        sexe,
        piste,
        duree,
        distance: 0,
        emoji: null
    };

    laps[currentRunner] = [];
    startTime = Date.now();
    durationSelected = duree * 1000; // durée en ms
    document.getElementById("chronoDisplay").textContent = "0:00";

    timerInterval = setInterval(updateChrono, 1000);
}

function updateChrono() {
    const elapsed = Date.now() - startTime;
    document.getElementById("chronoDisplay").textContent = formatTime(elapsed);

    // Arrêt auto quand durée atteinte
    if (elapsed >= durationSelected) {
        clearInterval(timerInterval);
        showEmojiSelection();
    }
}

function addLap() {
    const piste = runnerData[currentRunner].piste;
    if (!piste) {
        alert("Veuillez renseigner la distance de la piste avant d'ajouter un tour.");
        return;
    }
    laps[currentRunner].push(piste);
    runnerData[currentRunner].distance = laps[currentRunner].reduce((a, b) => a + b, 0);
    updateStatsDisplay();
}

function resetRace() {
    clearInterval(timerInterval);
    document.getElementById("chronoDisplay").textContent = "0:00";
    laps[currentRunner] = [];
    startTime = null;
    runnerData[currentRunner].distance = 0;
    updateStatsDisplay();
}

function showEmojiSelection() {
    const emojis = ["😊", "😐", "🤢"];
    const container = document.getElementById("etatForme");
    container.innerHTML = "<h3>État de forme ?</h3>";
    emojis.forEach(e => {
        const btn = document.createElement("button");
        btn.className = "etatBtn";
        btn.textContent = e;
        btn.onclick = () => {
            runnerData[currentRunner].emoji = e;
            if (currentRunner === 1) {
                currentRunner = 2;
                alert("Course 1 terminée. Saisissez les infos pour l'élève 2 et recommencez.");
            } else {
                generateQRCode();
            }
            container.innerHTML = "";
        };
        container.appendChild(btn);
    });
}

function updateStatsDisplay() {
    const distance = runnerData[currentRunner].distance || 0;
    const dureeSec = (durationSelected / 1000) || 1;
    const vitesse = calculateAverageSpeed(distance, dureeSec);
    const vma = calculateVMA(distance, dureeSec);

    document.getElementById("statsBox").innerHTML = `
        <div class="stat ligne-bleue">Distance totale (m)<br>${distance}</div>
        <div class="stat ligne-verte">Vitesse moyenne (km/h)<br>${vitesse}</div>
        <div class="stat ligne-jaune">VMA estimée (km/h)<br>${vma}</div>
    `;
}

// ===================== QR CODE =====================
function generateQRCode() {
    const allData = {
        eleve1: runnerData[1],
        eleve2: runnerData[2]
    };
    const qrText = JSON.stringify(allData);
    document.getElementById("qrCodeBox").innerHTML = "";
    new QRCode(document.getElementById("qrCodeBox"), {
        text: qrText,
        width: 200,
        height: 200
    });
}

// ===================== MODE PROF =====================
const PROF_CODE = "1234";

function checkProfCode() {
    const code = document.getElementById("profCode").value;
    if (code === PROF_CODE) {
        document.getElementById("profSection").style.display = "block";
        startQRScanner();
    } else {
        alert("Code incorrect.");
    }
}

// QR Code scanner avec html5-qrcode
function startQRScanner() {
    const html5QrCode = new Html5Qrcode("qr-scan-container");
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            const cameraId = devices[0].id;
            html5QrCode.start(
                cameraId,
                { fps: 10, qrbox: 250 },
                decodedText => {
                    processScannedData(decodedText);
                    html5QrCode.stop();
                },
                errorMessage => {
                    console.log("Scan en cours...");
                }
            ).catch(err => console.log(err));
        }
    });
}

function processScannedData(data) {
    try {
        const parsed = JSON.parse(data);
        displayProfTable(parsed);
    } catch (e) {
        alert("QR Code invalide.");
    }
}

function displayProfTable(data) {
    const table = document.getElementById("profResults");
    table.innerHTML = `
        <tr>
            <th>Prénom</th><th>Nom</th><th>Sexe</th><th>Distance</th><th>Vitesse (km/h)</th><th>VMA (km/h)</th><th>État</th>
        </tr>
    `;

    Object.values(data).forEach(el => {
        const vitesse = calculateAverageSpeed(el.distance, el.duree);
        const vma = calculateVMA(el.distance, el.duree);
        table.innerHTML += `
            <tr>
                <td>${el.prenom}</td>
                <td>${el.nom}</td>
                <td>${el.sexe}</td>
                <td>${el.distance}</td>
                <td>${vitesse}</td>
                <td>${vma}</td>
                <td>${el.emoji}</td>
            </tr>
        `;
    });
}
