// Simulation du scan QR Code
document.addEventListener('DOMContentLoaded', () => {
  const eleveInfo = document.getElementById('eleve-info');

  // Ici on simule la détection d'un QR code avec un ID d'élève
  setTimeout(() => {
    const eleves = loadData('eleves');
    if (eleves.length > 0) {
      const e = eleves[0]; // On prend le premier par défaut
      eleveInfo.textContent = `${e.nom} (${e.classe}) - ${e.distance}m en ${e.temps}`;
    } else {
      eleveInfo.textContent = "Aucun résultat trouvé.";
    }
  }, 2000);
});
