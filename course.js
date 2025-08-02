let currentRunner = 1;
let startTime, timerInterval, laps = 0;
let dataC1 = null;
let dataC2 = null;

function startCourse() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('startBtn').disabled = true;
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function addLap() {
  laps++;
  document.getElementById('laps').textContent = laps;
}

function endCourse() {
  clearInterval(timerInterval);
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const distance = laps * 200;
  const vitesse = (distance / elapsedSeconds) * 3.6;
  const vma = vitesse * 1.15;

  const runner = JSON.parse(sessionStorage.getItem(`eleve${currentRunner}`)) || {};
  const result = {
    ...runner,
    distance: distance,
    vitesse: vitesse.toFixed(2),
    vma: vma.toFixed(2)
  };

  if (currentRunner === 1) {
    dataC1 = result;
    sessionStorage.setItem("dataC1", JSON.stringify(result));
    currentRunner = 2;
    laps = 0;
    document.getElementById('laps').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('nextC2').style.display = 'none';
    document.getElementById('title').textContent = `Course de ${JSON.parse(sessionStorage.getItem("eleve2")).prenom}`;
  } else {
    dataC2 = result;
    sessionStorage.setItem("dataC2", JSON.stringify(result));
    window.location.href = "resume.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const runner = JSON.parse(sessionStorage.getItem("eleve1"));
  if (runner) {
    document.getElementById('title').textContent = `Course de ${runner.prenom}`;
  }

  document.getElementById('startBtn').addEventListener('click', startCourse);
  document.getElementById('lapBtn').addEventListener('click', addLap);
  document.getElementById('endBtn').addEventListener('click', endCourse);
});
