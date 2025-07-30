// Variables globales
let dureeCourse = 0; // en minutes
let distanceTour = 0; // en mètres
let vmaRef = 0;
let tours = 0;
let timerId = null;
let tempsRestant = 0;
let etatForme = null;
let nomEleve = '';
let prenomEleve = '';
let classeEleve = '';

const formCourse = document.getElementById('formCourse');
const interfaceCourse = document.getElementById('interfaceCourse');
const resetBtn = document.getElementById('resetBtn');

formCourse.addEventListener('submit', (e) => {
  e.preventDefault();

  nomEleve = document.getElementById('nom').value.trim();
  prenomEleve = document.getElementById('prenom').value.trim();
  classeEleve = document.getElementById('classe').value.trim();
  dureeCourse = parseInt(document.getElementById('dureeCourse').value);
  distanceTour = parseFloat(document.getElementById('distanceTour').value);
  vmaRef = parseFloat(document.getElementById('vmaRef').value);

  if (!nomEleve || !prenomEleve || !classeEleve || !dureeCourse || !distanceTour) {
    alert('Merci de remplir tous les champs obligatoires');
    return;
  }

  tempsRestant = dureeCourse * 60;
  tours = 0;
  etatForme = null;

  afficherInterfaceCourse();
});

function afficherInterfaceCourse() {
  interfaceCourse.style.display = 'block';
  resetBtn.style.display = 'inline-block';
  formCourse.style.display = 'none';

  interfaceCourse.innerHTML = `
    <h2>Course de ${prenomEleve} ${nomEleve} - Classe ${classeEleve}</h2>
    <div id="chrono" style="font-size: 2.5em; margin: 10px 0; text-align:center;">${formatTemps(tempsRestant)}</div>
    <div style="text-align:center;">
      <button id="btnStart" style="font-size:1.5em; padding:10px 30px;">Start</button>
      <button id="btnTour" style="font-size: 2em; padding: 15px 40px; margin: 20px auto; display:none;">Tour</button>
    </div>
    <div id="infosCourse" style="margin-top: 20px; text-align:center;">
      <p>Tours réalisés : <span id="nbTours">0</span></p>
      <p>Distance totale : <span id="distTotale">0</span> m (<span id="distTotaleKm">0.00</span> km)</p>
    </div>
    <div id="bilan" style="margin-top: 20px; display:none; border-top: 1px solid #ccc; padding-top: 10px; text-align:center;">
      <h3>Bilan final</h3>
      <p>Vitesse moyenne : <span id="vitesseMoy">0</span> km/h</p>
      <p>VMA de référence : <span id="vmaRefAff">${vmaRef > 0 ? vmaRef.toFixed(2) : 'N/A'}</span> km/h</p>
      <p>VMA estimée : <span id="vmaEstimee">0</span> km/h</p>
      <p>État de forme : <span id="etatForme"></span></p>
      <div id="qrCodeContainer" style="margin-top: 15px;"></div>
    </div>
  `;

  document.getElementById('btnStart').addEventListener('click', demarrerCourse);
  document.getElementById('btnTour').addEventListener('click', ajouterTour);
}

function formatTemps(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function demarrerCourse() {
  const btnStart = document.getElementById('btnStart');
  const btnTour = document.getElementById('btnTour');
  const chrono = document.getElementById('chrono');

  if (timerId !== null) return; // déjà lancé

  btnStart.style.display = 'none';
  btnTour.style.display = 'inline-block';

  timerId = setInterval(() => {
    tempsRestant--;
    chrono.textContent = formatTemps(tempsRestant);

    if (tempsRestant <= 10) {
      chrono.style.color = 'red';
    } else {
      chrono.style.color = 'black';
    }

    if (tempsRestant <= 0) {
      clearInterval(timerId);
      timerId = null;
      btnTour.style.display = 'none';
      afficherBilan();
      afficherEtatForme();
    }
  }, 1000);
}

function ajouterTour() {
  tours++;
  const nbTours = document.getElementById('nbTours');
  const distTotale = document.getElementById('distTotale');
  const distTotaleKm = document.getElementById('distTotaleKm');

  nbTours.textContent = tours;
  const distanceTotalMetres = tours * distanceTour;
  distTotale.textContent = distanceTotalMetres;
  distTotaleKm.textContent = (distanceTotalMetres / 1000).toFixed(2);
}

function calcVitesse(distanceM, tempsSec) {
  if (tempsSec === 0) return 0;
  return ((distanceM / 1000) / (tempsSec / 3600)).toFixed(2);
}

function calcVMA(distanceM, tempsSec) {
  const vitesseMoy = parseFloat(calcVitesse(distanceM, tempsSec));
  if (vmaRef > 0) return vmaRef.toFixed(2);
  return (vitesseMoy * 1.1).toFixed(2);
}

function afficherBilan() {
  const vitesseMoyElem = document.getElementById('vitesseMoy');
  const vmaEstimeeElem = document.getElementById('vmaEstimee');
  const bilan = document.getElementById('bilan');

  const distanceTotale = tours * distanceTour;
  const dureeSec = dureeCourse * 60;

  const vitesseMoy = calcVitesse(distanceTotale, dureeSec);
  const vmaEstimee = calcVMA(distanceTotale, dureeSec);

  vitesseMoyElem.textContent = vitesseMoy;
  vmaEstimeeElem.textContent = vmaEstimee;

  bilan.style.display = 'block';
}

function afficherEtatForme() {
  const bilan = document.getElementById('bilan');
  const etatSpan = document.getElementById('etatForme');

  const divEtat = document.createElement('div');
  divEtat.style.marginTop = '15px';

  const prompt = document.createElement('p');
  prompt.textContent = 'Comment te sens-tu après la course ?';

  const btnBien = document.createElement('button');
  btnBien.textContent = '🙂 Bien';
  btnBien.style.marginRight = '10px';

  const btnBof = document.createElement('button');
  btnBof.textContent = '😐 Bof';
  btnBof.style.marginRight = '10px';

  const btnMal = document.createElement('button');
  btnMal.textContent = '🤮 Mal';

  divEtat.appendChild(prompt);
  divEtat.appendChild(btnBien);
  divEtat.appendChild(btnBof);
  divEtat.appendChild(btnMal);

  bilan.appendChild(divEtat);

  btnBien.onclick = () => {
    etatForme = '🙂 Bien';
    etatSpan.textContent = etatForme;
    divEtat.remove();
    sauvegarderResultats();
  };

  btnBof.onclick = () => {
    etatForme = '😐 Bof';
    etatSpan.textContent = etatForme;
    divEtat.remove();
    sauvegarderResultats();
  };

  btnMal.onclick = () => {
    etatForme = '🤮 Mal';
    etatSpan.textContent = etatForme;
    divEtat.remove();
    sauvegarderResultats();
  };
}

function sauvegarderResultats() {
  const data = {
    nom: nomEleve,
    prenom: prenomEleve,
    classe: classeEleve,
    duree: dureeCourse,
    distanceTour,
    tours,
    vitesseMoy: calcVitesse(tours * distanceTour, dureeCourse * 60),
    vmaRef: vmaRef > 0 ? vmaRef.toFixed(2) : 'N/A',
    vmaEstimee: calcVMA(tours * distanceTour, dureeCourse * 60),
    etatForme,
  };

  localStorage.setItem('runStatsDerniereCourse', JSON.stringify(data));

  // Générer QR code avec API externe
  const jsonData = encodeURIComponent(JSON.stringify(data));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${jsonData}`;

  const qrContainer = document.getElementById('qrCodeContainer');
  qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR code des résultats" />`;
}

resetBtn.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  tours = 0;
  etatForme = null;
  interfaceCourse.style.display = 'none';
  resetBtn.style.display = 'none';
  formCourse.style.display = 'block';
  interfaceCourse.innerHTML = '';
});
