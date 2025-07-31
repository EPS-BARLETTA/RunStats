// Variables
let eleve1 = null;
let eleve2 = null;
let course1Done = false;

// Helper : activer/désactiver inputs et boutons élève 2
function setEleve2Active(active) {
  const ids = ['nom2', 'prenom2', 'sexe2', 'duree2'];
  ids.forEach(id => document.getElementById(id).disabled = !active);
  const btns = document.querySelectorAll('#eleve2 .etatBtn');
  btns.forEach(btn => btn.disabled = !active);

  const eleve2Div = document.getElementById('eleve2');
  if (active) {
    eleve2Div.style.opacity = "1";
    eleve2Div.style.pointerEvents = "auto";
  } else {
    eleve2Div.style.opacity = "0.5";
    eleve2Div.style.pointerEvents = "none";
  }
}

// Initial : eleve2 désactivé
setEleve2Active(false);

const etatButtons = document.querySelectorAll('.etatBtn');
etatButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const etat = btn.dataset.etat;

    // Selon élève en cours
    const nom = course1Done ? document.getElementById('nom2').value.trim() : document.getElementById('nom1').value.trim();
    const prenom = course1Done ? document.getElementById('prenom2').value.trim() : document.getElementById('prenom1').value.trim();
    const sexe = course1Done ? document.getElementById('sexe2').value : document.getElementById('sexe1').value;
    const duree = parseFloat(course1Done ? document.getElementById('duree2').value : document.getElementById('duree1').value);

    if (!nom || !prenom || !duree || isNaN(duree)) {
      alert("Veuillez renseigner nom, prénom, durée et sexe.");
      return;
    }

    const infos = { nom, prenom, sexe, duree, etat };

    if (!course1Done) {
      eleve1 = infos;
      afficherResultatsEleve(1, eleve1);
      resetInputs(2);
      course1Done = true;
      setEleve2Active(true);
      disableEleve1(true);
      alert("Course 1 terminée, veuillez renseigner le 2ème élève.");
    } else {
      eleve2 = infos;
      afficherResultatsEleve(2, eleve2);
      generateQRCode([eleve1, eleve2]);
      alert("Course 2 terminée, QR code généré !");
      // Bloquer toute saisie maintenant ?
      setEleve2Active(false);
      disableEleve1(true);
    }
  });
});

function afficherResultatsEleve(num, eleve) {
  const container = document.getElementById(`resultatsEleve${num}`);
  container.innerHTML = `
    <p><strong>Nom :</strong> ${eleve.nom}</p>
    <p><strong>Prénom :</strong> ${eleve.prenom}</p>
    <p><strong>Sexe :</strong> ${eleve.sexe === "M" ? "Garçon" : "Fille"}</p>
    <p><strong>Durée (min) :</strong> ${eleve.duree}</p>
    <p><strong>État :</strong> ${eleve.etat}</p>
  `;
}

function resetInputs(num) {
  document.getElementById(`nom${num}`).value = "";
  document.getElementById(`prenom${num}`).value = "";
  document.getElementById(`duree${num}`).value = "";
  document.getElementById(`sexe${num}`).value = "M";
}

function disableEleve1(disable) {
  const ids = ['nom1', 'prenom1', 'sexe1', 'duree1'];
  ids.forEach(id => document.getElementById(id).disabled = disable);
  const btns = document.querySelectorAll('#eleve1 .etatBtn');
  btns.forEach(btn => btn.disabled = disable);
}

// Génération QR code
function generateQRCode(data) {
  const container = document.getElementById("qrCodeBox");
  container.innerHTML = "";
  document.getElementById('qrContainer').style.display = "block";
  new QRCode(container, {
    text: JSON.stringify(data),
    width: 220,
    height: 220
  });
}
