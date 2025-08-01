// profs.js - Gestion du scan QR, affichage, tri et export CSV

document.addEventListener('DOMContentLoaded', () => {
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

  // Fonction d'ajout d'un élève à la liste et à la table
  function ajouterEleve(data) {
    // On récupère les deux élèves dans les données QR
    if (!data.eleve1 || !data.eleve2) return;

    // Ajouter les élèves à la liste
    eleves.push(data.eleve1);
    eleves.push(data.eleve2);
    afficherEleves();
  }

  // Affichage de la liste des élèves dans la table
  function afficherEleves() {
    elevesTableBody.innerHTML = '';
    eleves.forEach((eleve, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${eleve.nom}</td>
        <td>${eleve.prenom}</td>
        <td>${eleve.classe}</td>
        <td>${eleve.sexe}</td>
        <td>${eleve.vma !== null ? eleve.vma : ''}</td>
        <td>${eleve.distance}</td>
      `;
      elevesTableBody.appendChild(tr);
    });
  }

  // Fonction pour trier selon le critère choisi
  function trierEleves(critere) {
    switch (critere) {
      case 'alphabetique':
        eleves.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'vma':
        eleves.sort((a, b) => (b.vma || 0) - (a.vma || 0));
        break;
      case 'sexe':
        eleves.sort((a, b) => a.sexe.localeCompare(b.sexe));
        break;
      case 'distance':
        eleves.sort((a, b) => b.distance - a.distance);
        break;
      case 'classe':
        eleves.sort((a, b) => a.classe.localeCompare(b.classe));
        break;
    }
    afficherEleves();
  }

  // Recherche rapide
  rechercheInput.addEventListener('input', () => {
    const filter = rechercheInput.value.toLowerCase();
    const rows = elevesTableBody.querySelectorAll('tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? '' : 'none';
    });
  });

  triSelect.addEventListener('change', () => {
    trierEleves(triSelect.value);
  });

  // Création des groupes (exemple simple : groupes de 4 selon la VMA décroissante)
  creerGroupesBtn.addEventListener('click', () => {
    if (eleves.length === 0) {
      alert("Aucun élève à grouper !");
      return;
    }

    // Trier par VMA décroissante
    eleves.sort((a, b) => (b.vma || 0) - (a.vma || 0));

    const groupes = [];
    let groupeNum = 1;

    for (let i = 0; i < eleves.length; i += 4) {
      groupes.push({
        nomGroupe: 'Groupe ' + groupeNum,
        membres: eleves.slice(i, i + 4)
      });
      groupeNum++;
    }

    // Afficher groupes
    groupesSection.style.display = 'block';
    groupesTableBody.innerHTML = '';
    groupes.forEach(groupe => {
      groupe.membres.forEach(eleve => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${groupe.nomGroupe}</td>
          <td>${eleve.nom}</td>
          <td>${eleve.prenom}</td>
          <td>${eleve.classe}</td>
          <td>${eleve.sexe}</td>
          <td>${eleve.vma !== null ? eleve.vma : ''}</td>
          <td>${eleve.distance}</td>
        `;
        groupesTableBody.appendChild(tr);
      });
    });
  });

  // Export CSV simple
  function exportCSV(dataArray, filename) {
    const headers = Object.keys(dataArray[0]).join(';');
    const rows = dataArray.map(obj =>
      Object.values(obj).map(val => `"${val}"`).join(';')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.click();
  }

  exportCSVBtn.addEventListener('click', () => {
    if (eleves.length === 0) {
      alert('Aucun élève à exporter.');
      return;
    }
    exportCSV(eleves, 'eleves.csv');
  });

  exportGroupesCSVBtn.addEventListener('click', () => {
    const rows = [];
    const trs = groupesTableBody.querySelectorAll('tr');
    if (trs.length === 0) {
      alert('Aucun groupe à exporter.');
      return;
    }
    trs.forEach(tr => {
      const cells = tr.querySelectorAll('td');
      const obj = {
        Groupe: cells[0].textContent,
        Nom: cells[1].textContent,
        Prénom: cells[2].textContent,
        Classe: cells[3].textContent,
        Sexe: cells[4].textContent,
        VMA: cells[5].textContent,
        Distance: cells[6].textContent
      };
      rows.push(obj);
    });
    exportCSV(rows, 'groupes.csv');
  });

  // --- Gestion du scan QR code ---

  // Pour scanner le QR code, on peut utiliser la librairie 'html5-qrcode' ou une autre,
  // ici on met un placeholder. Implémenter avec une vraie librairie de scan vidéo si besoin.

  startScanBtn.addEventListener('click', () => {
    alert("Fonction de scan QR à implémenter (librairie requise)");
    // Ex : utiliser html5-qrcode ou autre librairie QR code scan via webcam
  });

});
