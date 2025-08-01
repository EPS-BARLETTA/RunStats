// script.js
// Fonctions globales partagées entre pages si nécessaire

// Calcul de la VMA (simplifié) : VMA ≈ Distance totale (m) / Durée (s) * 3.6
function calculerVMA(distanceMetres, tempsSecondes) {
    if (tempsSecondes <= 0) return 0;
    return (distanceMetres / tempsSecondes) * 3.6;
}

// Formatage du temps en mm:ss
function formatTemps(secondes) {
    const min = Math.floor(secondes / 60);
    const sec = secondes % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
