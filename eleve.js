document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eleve-form');
  const qrCodeContainer = document.getElementById('qrcode');
  const addTourBtn = document.getElementById('addTourBtn');
  const chronoDisplay = document.getElementById('chronoDisplay');
  const generateQRBtn = document.getElementById('generateQRBtn');

  // Variables pour chrono
  let startTime = null;
  let timerInterval = null;
  let toursEleve1 = 0;
  let toursEleve2 = 0;

  // Durees en secondes par élève (pour gérer vitesse moyenne)
  let dureeEleve1 = 0;
  let dureeEleve2 = 0;

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function updateChrono() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    chronoDisplay.textContent = `Durée : ${formatTime(elapsed)}`;

    // Mettre à jour duree Eleve 1 & 2 proportionnellement aux tours (même chrono ici mais ça pourrait différer)
    // Ici on répartit la durée selon le nombre de tours pour chaque élève (on suppose qu'ils tournent simultanément)
    if (toursEleve1 + toursEleve2 > 0) {
      dureeEleve1 = Math.floor(elapsed * (toursEleve1 / (toursEleve1 + toursEleve2)));
      dureeEleve2 = elapsed - dureeEleve1;
    } else {
      dureeEleve1 = 0;
      dureeEleve2 = 0;
    }
  }

  // Lancer chrono au premier tour
  function startChrono() {
    if (!startTime) {
      startTime = Date.now();
      timerInterval = setInterval(updateChrono, 1000);
    }
  }

  addTourBtn.addEventListener('click', () => {
    // Incrémenter les tours pour chaque élève (ici on fait 1 tour chacun par clic, on peut complexifier si besoin)
    toursEleve1++;
    toursEleve2++;
    startChrono();
    updateChrono();
  });

  generateQRBtn.addEventListener('click', () => {
    // Récupérer infos + calculer distances + vitesses + VMA estimée

    // Élève 1
    const nom1 = document.getElementById('nom1').value.trim();
    const prenom1 = document.getElementById('prenom1').value.trim();
    const classe1 = document.getElementById('classe1').value.trim();
    const sexe1 = document.getElementById('sexe1').value;
    const distanceTour1 = parseFloat(document.getElementById('distance1').value);

    // Élève 2
    const nom2 = document.getElementById('nom2').value.trim();
    const prenom2 = document.getElementById('prenom2').value.trim();
    const classe2 = document.getElementById('classe2').value.trim();
    const sexe2 = document.getElementById('sexe2').value;
    const distanceTour2 = parseFloat(document.getElementById('distance2').value);

    if (!nom1 || !prenom1 || !classe1 || !distanceTour1 || !nom2 || !prenom2 || !classe2 || !distanceTour2) {
      alert('Veuillez remplir tous les champs et distances.');
      return;
    }

    // Calculs Élève 1
    const distanceParcourue1 = toursEleve1 * distanceTour1; // en mètres
    const dureeS1 = dureeEleve1 > 0 ? dureeEleve1 : 1; // éviter div par 0
    const vitesseMoyenne1 = distanceParcourue1 / dureeS1; // m/s
    const vmaEstimee1 = vitesseMoyenne1 * 1.1; // facteur 10% au-dessus vitesse moyenne (exemple)

    // Calculs Élève 2
    const distanceParcourue2 = toursEleve2 * distanceTour2; 
    const dureeS2 = dureeEleve2 > 0 ? dureeEleve2 : 1;
    const vitesseMoyenne2 = distanceParcourue2 / dureeS2;
    const vmaEstimee2 = vitesseMoyenne2 * 1.1;

    // Préparer objet JSON
    const eleve1 = {
      nom: nom1,
      prenom: prenom1,
      classe: classe1,
      sexe: sexe1,
      duree: formatTime(dureeS1),
      distance: distanceParcourue1.toFixed(1),
      vma: vmaEstimee1.toFixed(2)
    };

    const eleve2 = {
      nom: nom2,
      prenom: prenom2,
      classe: classe2,
      sexe: sexe2,
      duree: formatTime(dureeS2),
      distance: distanceParcourue2.toFixed(1),
      vma: vmaEstimee2.toFixed(2)
    };

    const data = { eleve1, eleve2 };
    const jsonData = JSON.stringify(data);

    // Effacer ancien QR code
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
      text: jsonData,
      width: 250,
      height: 250
    });
  });

});
