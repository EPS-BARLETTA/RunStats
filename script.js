let timer;
let time = 0;
let laps = 0;
let etat = "";

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const chronoDisplay = document.getElementById("chronoDisplay");
const lapsCount = document.getElementById("lapsCount");
const etatForme = document.getElementById("etatForme");
const qrContainer = document.getElementById("qrContainer");
const qrCodeBox = document.getElementById("qrCodeBox");

function formatTime(t) {
  const minutes = Math.floor(t / 60);
  const seconds = t % 60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function updateDisplay() {
  chronoDisplay.textContent = formatTime(time);
  lapsCount.textContent = laps;
}

startBtn.addEventListener("click", () => {
  const dureeMin = parseFloat(document.getElementById("duree").value);
  if (!dureeMin || dureeMin <= 0) {
    alert("Veuillez saisir une durée valide.");
    return;
  }

  startBtn.disabled = true;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  chronoDisplay.classList.remove("red");

  timer = setInterval(() => {
    time++;
    updateDisplay();

    if (time >= dureeMin * 60) {
      clearInterval(timer);
      chronoDisplay.classList.add("red");
      lapBtn.disabled = true;
      etatForme.style.display = "block";
    }
  }, 1000);
});

lapBtn.addEventListener("click", () => {
  laps++;
  updateDisplay();
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  time = 0;
  laps = 0;
  startBtn.disabled = false;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  etatForme.style.display = "none";
  qrContainer.style.display = "none";
  qrCodeBox.innerHTML = "";
  chronoDisplay.classList.remove("red");
  updateDisplay();
});

document.querySelectorAll(".etatBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    etat = btn.dataset.etat;
    etatForme.style.display = "none";

    const data = {
      eleve1: "Jean Dupont",
      eleve2: "Marie Curie",
      duree: formatTime(time),
      tours: laps,
      etat: etat,
      timestamp: new Date().toISOString()
    };

    const text = JSON.stringify(data);
    qrCodeBox.innerHTML = "";
    new QRCode(qrCodeBox, {
      text: text,
      width: 200,
      height: 200
    });

    qrContainer.style.display = "block";
  });
});
