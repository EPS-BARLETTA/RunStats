// eleve.js - Gestion du formulaire élève et génération du QR code

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eleve-form');
  const qrCodeContainer = document.getElementById('qrcode');

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Récupération des données élève 1
    const eleve1 = {
      nom: document.getElementById('nom1').value.trim(),
      prenom: document.getElementById('prenom1').value.trim(),
      classe: document.getElementById('classe1').value.trim(),
      sexe: document.getElementById('sexe1').value,
      duree: document.getElementById('duree1').value.trim(),
      distance: document.getElementById('distance1').value.trim(),
      vma: document.getElementById('vma1').value.trim()
    };

    // Récupération des données élève 2
    const eleve2 = {
      nom: document.getElementById('nom2').value.trim(),
      prenom: document.getElementById('prenom2').value.trim(),
      classe: document.getElementById('classe2').value.trim(),
      sexe: document.getElementById('sexe2').value,
      duree: document.getElementById('duree2').value.trim(),
      distance: document.getElementById('distance2').value.trim(),
      vma: document.getElementById('vma2').value.trim()
    };

    // Préparation des données à encoder
    const data = {
      eleve1,
      eleve2
    };

    // Conversion en JSON pour encoder dans le QR code
    const jsonData = JSON.stringify(data);

    // Effacer un ancien QR code
    qrCodeContainer.innerHTML = '';

    // Générer QR code (utilise une bibliothèque comme QRCode.js)
    new QRCode(qrCodeContainer, {
      text: jsonData,
      width: 200,
      height: 200
    });
  });
});

