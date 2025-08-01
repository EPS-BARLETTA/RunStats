// prof.js - Gestion de la lecture des QR codes et tri/groupement

document.addEventListener('DOMContentLoaded', () => {
  const scanButton = document.getElementById('start-scan');
  const tableBody = document.getElementById('data-table-body');
  const groupsTableBody = document.getElementById('groups-table-body');
  const exportBtn = document.getElementById('export-csv');
  const createGroupsBtn = document.getElementById('create-groups');

  let allStudents = [];

  // Fonction pour ajouter des élèves au tableau
  function addStudentsToTable(students) {
    students.forEach(s => {
      allStudents.push(s);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.nom}</td>
        <td>${s.prenom}</td>
        <td>${s.classe}</td>
        <td>${s.sexe}</td>
        <td>${s.vma || ''}</td>
        <td>${s.distance || ''}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Lecture QR code avec une librairie (ex: Html5Qrcode)
  scanButton.addEventListener('click', () => {
    // TODO: lancer la caméra et scanner les QR codes
    // A chaque scan, récupérer les données JSON
    // Exemple de données reçues :
    /*
      {
        eleve1: {...},
        eleve2: {...}
      }
    */
    // Ici, simuler un scan (remplace par le vrai scan)
    const sampleScan = {
      eleve1: {
        nom: "Dupont",
        prenom: "Alice",
        classe: "3A",
        sexe: "Fille",
        vma: "14",
        distance: "1000"
      },
      eleve2: {
        nom: "Martin",
        prenom: "Bob",
        classe: "3A",
        sexe: "Garçon",
        vma: "12",
        distance: "950"
      }
    };

    addStudentsToTable([sampleScan.eleve1, sampleScan.eleve2]);
  });

  // Fonction tri simple par colonne (exemple VMA)
  function sortStudents(by) {
    allStudents.sort((a, b) => {
      if (by === 'vma' || by === 'distance') {
        return (parseFloat(b[by]) || 0) - (parseFloat(a[by]) || 0);
      }
      return (a[by] || '').localeCompare(b[by] || '');
    });
    refreshTable();
  }

  function refreshTable() {
    tableBody.innerHTML = '';
    allStudents.forEach(s => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.nom}</td>
        <td>${s.prenom}</td>
        <td>${s.classe}</td>
        <td>${s.sexe}</td>
        <td>${s.vma || ''}</td>
        <td>${s.distance || ''}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Exemple de création de groupes mixtes de 4 selon ta règle
  function createGroups() {
    groupsTableBody.innerHTML = '';

    // Trier les élèves par VMA décroissante
    const sorted = [...allStudents].sort((a, b) => (parseFloat(b.vma) || 0) - (parseFloat(a.vma) || 0));

    const groups = [];
    while (sorted.length >= 4) {
      // 1 VMA haute
      const high = sorted.shift();
      // 2 VMA moyennes
      const mid1 = sorted.splice(Math.floor(sorted.length / 2), 1)[0];
      const mid2 = sorted.splice(Math.floor(sorted.length / 2), 1)[0];
      // 1 VMA basse
      const low = sorted.pop();

      const group = [high, mid1, mid2, low].filter(Boolean);
      groups.push(group);
    }

    // Afficher groupes
    groups.forEach((g, i) => {
      g.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>Groupe ${i+1}</td>
          <td>${student.nom}</td>
          <td>${student.prenom}</td>
          <td>${student.classe}</td>
          <td>${student.sexe}</td>
          <td>${student.vma || ''}</td>
          <td>${student.distance || ''}</td>
        `;
        groupsTableBody.appendChild(row);
      });
    });
  }

  // Export CSV basique
  function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nom,Prénom,Classe,Sexe,VMA,Distance\n";

    allStudents.forEach(s => {
      const row = [s.nom, s.prenom, s.classe, s.sexe, s.vma || '', s.distance || ''].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "eleves.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Liens boutons
  document.getElementById('sort-vma').addEventListener('click', () => sortStudents('vma'));
  document.getElementById('sort-sexe').addEventListener('click', () => sortStudents('sexe'));
  document.getElementById('sort-distance').addEventListener('click', () => sortStudents('distance'));
  document.getElementById('sort-classe').addEventListener('click', () => sortStudents('classe'));
  createGroupsBtn.addEventListener('click', createGroups);
  exportBtn.addEventListener('click', exportCSV);

});

