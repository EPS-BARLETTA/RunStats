// profs.js

// Cette partie peut être séparée pour une meilleure organisation,
// mais ici tout est déjà dans profs.html pour simplicité,
// donc ce fichier peut rester léger ou vide selon ton organisation.

// Si tu veux externaliser le script, voici la logique principale :

document.addEventListener('DOMContentLoaded', () => {
  // On récupère les éléments du DOM
  const startScanBtn = document.getElementById('startScanBtn');
  const videoElem = document.getElementById('video');
  const elevesTableBody = document.querySelector('#elevesTable tbody');
  const triSelect = document.getElementById('triSelect');
  const creerGroupesBtn = document.getElementById('creerGroupesBtn');
  const exportCSVBtn = document.getElementById('exportCSVBtn');
  const rechercheInput = document.getElementById('rechercheInput');
  const groupesSection = document.getElementById('groupesSection');
  const groupesTableBody = document.querySelector('#groupesTable tbody');
  const exportGroupesCSVBtn = document.getElementById('exportGroupesCSVBtn');

  let eleves = [];
  let groupes = [];
  let scanning = false;
  let html5QrcodeScanner = null;

  function ajouterEleves(nouveauxEleves) {
    nouveauxEleves.forEach(el => {
      if (!eleves.some(e => e.nom === el.nom && e.prenom === el.prenom && e.classe === el.classe)) {
        eleves.push(el);
      }
    });
    afficherEleves();
  }

  function afficherEleves() {
    const filtre = rechercheInput.value.toLowerCase();
    const tri = triSelect.value;

    let liste = eleves.filter(e => {
      return (
        e.nom.toLowerCase().includes(filtre) ||
        e.prenom.toLowerCase().includes(filtre) ||
        e.classe.toLowerCase().includes(filtre) ||
        e.sexe.toLowerCase().includes(filtre)
      );
    });

    if (tri === 'alphabetique') {
      liste.sort((a,b) => a.nom.localeCompare(b.nom));
    } else if (tri === 'vma') {
      liste.sort((a,b) => (b.vma || 0) - (a.vma || 0));
    } else if (tri === 'sexe') {
      liste.sort((a,b) => a.sexe.localeCompare(b.sexe));
    } else if (tri === 'distance') {
      liste.sort((a,b) => (b.distance || 0) - (a.distance || 0));
    } else if (tri === 'classe') {
      liste.sort((a,b) => a.classe.localeCompare(b.classe));
    }

    elevesTableBody.innerHTML = '';
    liste.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.nom}</td>
        <td>${e.prenom}</td>
        <td>${e.classe}</td>
        <td>${e.sexe}</td>
        <td>${e.vma !== null && e.vma !== undefined ? e.vma : ''}</td>
        <td>${e.distance !== null && e.distance !== undefined ? e.distance : ''}</td>
      `;
      elevesTableBody.appendChild(tr);
    });
  }

  function creerGroupes() {
    groupesSection.style.display = 'block';
    groupesTableBody.innerHTML = '';
    groupes = [];

    let elevesAvecVma = eleves.filter(e => e.vma !== null && e.vma !== undefined).sort((a,b) => b.vma - a.vma);
    if (elevesAvecVma.length < 4) {
      alert('Pas assez d\'élèves avec VMA pour créer des groupes');
      return;
    }

    const n = elevesAvecVma.length;
    const seuilHaute = elevesAvecVma[Math.floor(n / 3)].vma;
    const seuilBasse = elevesAvecVma[Math.floor(2 * n / 3)].vma;

    const haute = elevesAvecVma.filter(e => e.vma >= seuilHaute);
    const moyenne = elevesAvecVma.filter(e => e.vma < seuilHaute && e.vma >= seuilBasse);
    const basse = elevesAvecVma.filter(e => e.vma < seuilBasse);

    while (true) {
      if (haute.length === 0 || moyenne.length < 2 || basse.length === 0) break;

      const groupe = [];
      groupe.push(haute.pop());
      groupe.push(moyenne.pop());
      groupe.push(moyenne.pop());
      groupe.push(basse.pop());

      groupes.push(groupe);
    }

    groupes.forEach((groupe, i) => {
      groupe.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>G${i+1}</td>
          <td>${e.nom}</td>
          <td>${e.prenom}</td>
          <td>${e.classe}</td>
          <td>${e.sexe}</td>
          <td>${e.vma !== null && e.vma !== undefined ? e.vma : ''}</td>
          <td>${e.distance !== null && e.distance !== undefined ? e.distance : ''}</td>
        `;
        groupesTableBody.appendChild(tr);
      });
    });
  }

  function exportCSV(data, filename) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(';'));
    data.forEach(row => {
      const values = headers.map(h => row[h]);
      csvRows.push(values.join(';'));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportCSVBtn.addEventListener('click', () => {
    if (eleves.length === 0) {
      alert('Aucun élève à exporter');
      return;
    }
    exportCSV(eleves, 'eleves.csv');
  });

  exportGroupesCSVBtn.addEventListener('click', () => {
    if (groupes.length === 0) {
      alert('Aucun groupe à exporter');
      return;
    }
    const flatGroupes = groupes.flat().map(e => ({
      Groupe: groupes.findIndex(g => g.includes(e)) + 1,
      Nom: e.nom,
      Prenom: e.prenom,
      Classe: e.classe,
      Sexe: e.sexe,
      VMA: e.vma,
      Distance: e.distance
    }));
    exportCSV(flatGroupes, 'groupes.csv');
  });

  rechercheInput.addEventListener('input', afficherEleves);
  triSelect.addEventListener('change', afficherEleves);
  creerGroupesBtn.addEventListener('click', creerGroupes);

  // Scan QR code avec Html5Qrcode
  startScanBtn.addEventListener('click', () => {
    if (!scanning) {
      startScanBtn.textContent = 'Arrêter le scan';
      videoElem.style.display = 'block';

      html5QrcodeScanner = new Html5Qrcode("video");

      html5QrcodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250
        },
        qrCodeMessage => {
          try {
            const data = JSON.parse(qrCodeMessage);
            if (data.eleves && Array.isArray(data.eleves)) {
              ajouterEleves(data.eleves);
              alert("Élève(s) ajouté(s) via QR code !");
            } else {
              alert("QR code invalide");
            }
          } catch (e) {
            alert("Erreur lors de la lecture du QR code");
          }
          html5QrcodeScanner.stop().then(() => {
            scanning = false;
            startScanBtn.textContent = 'Scanner un QR Code';
            videoElem.style.display = 'none';
          }).catch(err => {
            console.error(err);
          });
        },
        errorMessage => {
          // Optionnel : console.log('Scan erreur :', errorMessage);
        }
      ).catch(err => {
        alert('Erreur accès caméra : ' + err);
        scanning = false;
        startScanBtn.textContent = 'Scanner un QR Code';
        videoElem.style.display = 'none';
      });

      scanning = true;
    } else {
      html5QrcodeScanner.stop().then(() => {
        scanning = false;
        startScanBtn.textContent = 'Scanner un QR Code';
        videoElem.style.display = 'none';
      }).catch(err => {
        console.error(err);
      });
    }
  });

});
