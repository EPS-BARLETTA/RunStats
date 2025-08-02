/* Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

/* Corps */
body {
    background-color: #f4f4f9;
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

/* Header */
header {
    text-align: center;
    margin-bottom: 20px;
}

header h1 {
    font-size: 2.5em;
    color: #2c3e50;
}

header p {
    font-size: 1.2em;
    color: #7f8c8d;
}

/* Container principal */
.container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1000px;
    gap: 20px;
}

/* Formulaire Élève */
.eleve-form {
    flex: 1;
    padding: 20px;
    border-radius: 12px;
    color: #fff;
}

#eleve1 {
    background-color: #3498db; /* Bleu */
}

#eleve2 {
    background-color: #2ecc71; /* Vert */
}

.eleve-form h2 {
    text-align: center;
    margin-bottom: 15px;
}

.eleve-form label {
    display: block;
    margin: 10px 0 5px;
}

.eleve-form input,
.eleve-form select {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 6px;
    margin-bottom: 10px;
}

/* Section course */
.course-info {
    width: 100%;
    max-width: 1000px;
    margin-top: 20px;
    padding: 20px;
    background-color: #f1c40f;
    border-radius: 12px;
    text-align: center;
}

.course-info label {
    display: block;
    margin: 10px 0 5px;
}

.course-info input {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 6px;
    margin-bottom: 10px;
}

/* Boutons */
button {
    padding: 12px 20px;
    margin: 10px;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button#startBtn {
    background-color: #2980b9;
    color: #fff;
}

button#startBtn:hover {
    background-color: #1f6390;
}

button#lapBtn {
    background-color: #27ae60;
    color: #fff;
    border-radius: 50px; /* bouton oval */
}

button#lapBtn:hover {
    background-color: #1e8449;
}

button#resetBtn {
    background-color: #e74c3c;
    color: #fff;
}

button#resetBtn:hover {
    background-color: #c0392b;
}

/* Minuteur */
.timer {
    font-size: 2em;
    font-weight: bold;
    margin: 20px 0;
}

/* Animation clignotante rouge */
@keyframes blink {
    0% { color: red; opacity: 1; }
    50% { color: red; opacity: 0; }
    100% { color: red; opacity: 1; }
}

.blink {
    animation: blink 1s infinite;
}

/* Pied de page */
footer {
    margin-top: 30px;
    text-align: center;
    font-size: 0.9em;
    color: #7f8c8d;
}
