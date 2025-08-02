document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('eleve-body');

  function renderTable() {
    const eleves = loadData('eleves');
    tbody.innerHTML = '';
    eleves.forEach((eleve, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${eleve.nom}</td>
        <td>${eleve.classe}</td>
        <td>${eleve.distance}</td>
        <td>${eleve.temps}</td>
        <td>
          <button onclick="deleteEleve(${index})">Supprimer</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  renderTable();

  window.deleteEleve = (index) => {
    const eleves = loadData('eleves');
    eleves.splice(index, 1);
    saveData('eleves', eleves);
    renderTable();
  };
});
