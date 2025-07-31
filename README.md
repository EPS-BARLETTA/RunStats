# RunStats - Application de gestion de courses

## Description

RunStats est une application web permettant de chronométrer des courses, gérer les tours, calculer les statistiques comme la vitesse moyenne et la VMA estimée, et enregistrer les résultats. L'application génère également un QR Code avec les données des courses et permet à un professeur d'importer ces résultats via un scanner QR intégré.

## Fonctionnalités

- Chronomètre avec gestion de la durée et des tours
- Calcul de la distance totale, vitesse moyenne et VMA estimée
- Enregistrement des résultats pour deux courses
- Génération et affichage d'un QR Code des résultats
- Interface professeur avec authentification par code PIN
- Scanner QR Code pour importer les résultats des élèves
- Export des résultats en fichier CSV

## Installation

1. Cloner le dépôt ou télécharger les fichiers.
2. Ouvrir `index.html` dans un navigateur moderne.
3. Utiliser l'interface pour chronométrer et gérer les courses.

## Utilisation

- Remplir la durée et la distance d'un tour avant de démarrer.
- Cliquer sur "Démarrer" pour lancer le chrono.
- Cliquer sur "Tour suivant" à chaque tour réalisé.
- Cliquer sur "Réinitialiser" pour tout remettre à zéro.
- À la fin, sélectionner l'état de forme pour enregistrer le résultat.
- Pour le professeur, entrer le code PIN et scanner les QR Codes pour importer les résultats.
- Exporter les résultats en CSV via l'interface professeur.

## Dépendances

- [QRCode.js](https://github.com/davidshimjs/qrcodejs)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)

## Licence

MIT License
