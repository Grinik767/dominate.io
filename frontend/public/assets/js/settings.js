import {makeFadeOut, generateName, makeFadeIn} from "./utils.js";
const changeNameButton = document.querySelector('.btn');
const inputField = document.querySelector('#nameInput');

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('#nameInput');
    let playerName = localStorage.getItem('playerName');

    if (!playerName) {
        playerName = generateName(playerName);
        localStorage.setItem('playerName', playerName);
    }
    input.value = playerName;

    changeNameButton.addEventListener('click', () => {
        localStorage.setItem('playerName', inputField.value.trim());
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            makeFadeOut();
        }
    });

    makeFadeIn();
});