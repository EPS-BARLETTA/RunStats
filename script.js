// script.js

// Fonctions globales communes

/**
 * Fonction pour formater un temps en mm:ss
 * @param {number} secondes 
 * @returns {string}
 */
function formatTemps(secondes) {
  const min = Math.floor(secondes / 60);
  const sec = secondes % 60;
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

/**
 * Fonction pour calculer la vitesse moyenne en km/h
 * @param {number} distance en mètres
 * @param {number} temps en secondes
 * @returns {number} vitesse en km/h
 */
function calculerVitesse(distance, temps) {
  if (temps === 0) return 0;
  return (distance / 1000) / (temps / 3600);
}

/**
 * Fonction pour créer un élément DOM avec classe et contenu texte
 * @param {string} tag 
 * @param {string} className 
 * @param {string} textContent 
 * @returns {HTMLElement}
 */
function creerElement(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

