let currentRunner = 1;
let startTime, timerInterval, laps = 0;

function startCourse() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('lapBtn').disabled = false;
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
  const distance = laps * parseFloat(sessionStorage.getItem('longueurTour')) || 0;
  const vitesse = (distance / elapsedSeconds) * 3.6;
  const result = {
    ...JSON.parse(sessionStorage.getItem(`eleve${currentRunner}`)),
    distance: Math.round(distance),
    vitesse: vitesse.toFixed(2),
    vmaEstimee: (vitesse * 3.6).toFixed(1)
  };

  sessionStorage.setItem(`dataC${currentRunner}`, JSON.stringify(result));

  if (currentRunner === 1) {
    currentRunner = 2;
    laps = 0;
    document.getElementById('laps').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('title').textContent = `Course de ${JSON.parse(sessionStorage.getItem('eleve2')).prenom}`;
    document.getElementById('startBtn').disabled = false;
  } else {
    window.location.href = 'resume.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const runner = JSON.parse(sessionStorage.getItem('eleve1'));
  document.getElementById('title').textContent = runner ? `Course de ${runner.prenom}` : '';
  document.getElementById('laps').textContent = '0';

  document.getElementById('startBtn').addEventListener('click', startCourse);
  document.getElementById('lapBtn').addEventListener('click', addLap);
  document.getElementById('endBtn').addEventListener('click', endCourse);
});
