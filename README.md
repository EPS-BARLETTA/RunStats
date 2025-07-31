# RunStats - Equipe EPS Lycée Vauban - LUXEMBOURG

## Description

Application Web de gestion des résultats de courses pour élèves du Lycée Vauban, développée par l'équipe EPS du Lycée Vauban, Luxembourg.

Les élèves saisissent leurs informations (nom, prénom, sexe, durée) ainsi que leur état via emoji. À la fin des deux courses, un QR code est généré avec les données des deux élèves.

Les professeurs peuvent scanner ces QR codes, accéder à un tableau centralisé des résultats, trier les élèves et créer des groupes mixtes selon leur VMA (haute, moyenne, basse) et mixité garçons/filles.

---

## Fonctionnalités

- Saisie des données des deux élèves par course
- Calcul automatique de la VMA estimée
- Choix de l'état via emoji
- Génération et affichage d'un QR code contenant les données des deux élèves
- Interface professeur protégée par code PIN (1976)
- Scanner QR code côté professeur pour ajouter les données au tableau global
- Tri et création automatique de groupes mixtes (4 élèves par groupe, mixité sexe et VMA)
- Export des résultats au format CSV

---

## Installation et utilisation

1. Cloner ce dépôt GitHub.
2. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Edge).
3. Les élèves saisissent leurs données et valident leur état en emoji.
4. Un QR code s'affiche à la fin des deux saisies.
5. Le professeur entre le code PIN **1976** pour accéder à l'interface de scan et de gestion.
6. Scanner les QR codes générés pour alimenter le tableau.
7. Utiliser le bouton "Créer Groupes Mixte VMA" pour générer les groupes.
8. Exporter les résultats au format CSV si besoin.

---

## Technologies utilisées

- HTML5 / CSS3
- JavaScript ES6
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) (via CDN)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) (via CDN)

---

## Auteur

Jérome BARLETTA  
Equipe EPS Lycée Vauban - Luxembourg

---

## Licence

Ce projet est libre d'utilisation pour usage pédagogique.
