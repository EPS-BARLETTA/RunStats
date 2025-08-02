// Fonctions communes

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function exportCSV() {
  const data = loadData('eleves');
  if (data.length === 0) {
    alert("Aucune donnée à exporter !");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Nom,Classe,Distance,Temps\n";
  data.forEach(e => {
    csvContent += `${e.nom},${e.classe},${e.distance},${e.temps}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "resultats.csv");
  document.body.appendChild(link);
  link.click();
}
