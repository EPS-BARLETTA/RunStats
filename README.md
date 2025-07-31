# RunStats - Equipe EPS Lycée Vauban - Luxembourg

Application web pour la gestion et le suivi des courses VMA en EPS.

---

## Description

RunStats permet à deux élèves de saisir leurs données de course (nom, prénom, sexe, classe, durée, distance de piste, VMA optionnelle) et d’enregistrer leurs tours en temps réel via un chronomètre.

Après chaque course, les élèves renseignent leur état de forme via des boutons emoji.

L’enseignant peut scanner le QR code généré contenant toutes les données des deux courses pour importer les résultats dans un tableau.

Il est aussi possible d’exporter ces données en CSV.

---

## Fonctionnalités

- Chronomètre avec gestion des tours
- Calculs de vitesse moyenne et VMA estimée
- Enregistrement des données élèves
- Sélection d’état de forme avec emoji
- Génération et lecture QR code
- Interface Professeur avec scan QR code
- Export CSV

---

## Installation

1. Cloner le dépôt
2. Ouvrir `index.html` dans un navigateur moderne
3. Utiliser directement, aucune configuration serveur nécessaire

---

## Usage

- L’élève saisit ses informations et démarre le chronomètre.
- Après la course, sélection de l’état de forme.
- Pour la deuxième course, les élèves inversent leur rôle.
- L’enseignant se connecte avec le code PIN pour scanner le QR code.
- Résultats affichés dans un tableau, export CSV possible.

---

## Dépendances

- [QRCode.js](https://davidshimjs.github.io/qrcodejs/)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)

---

## Licence

MIT License
