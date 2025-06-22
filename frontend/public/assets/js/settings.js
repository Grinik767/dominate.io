import {makeFadeOut, generateName, makeFadeIn, emulateButtonClick} from "./utils.js";
const changeNameButton = document.querySelector('.btn');
const inputField = document.querySelector('#nameInput');

document.addEventListener('DOMContentLoaded', () => {
    let playerName = localStorage.getItem('playerName');

    if (!playerName) {
        playerName = generateName(playerName);
        localStorage.setItem('playerName', playerName);
    }
    inputField.value = playerName;

    inputField.focus();

    changeNameButton.addEventListener('click', () => {
        localStorage.setItem('playerName', inputField.value.trim());
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            makeFadeOut();
        }
        else if (e.key === 'Enter') {
            emulateButtonClick(changeNameButton);
        }
    });

    makeFadeIn();
});
