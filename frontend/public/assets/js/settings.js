import {makeFadeOut, generateName, makeFadeIn, emulateButtonClick, isValidPlayerName} from "./utils.js";
const changeNameButton = document.querySelector('.btn');
const inputField = document.querySelector('#nameInput');
const errorMessage = document.querySelector('.errorMessage');

document.addEventListener('DOMContentLoaded', () => {
    let playerName = localStorage.getItem('playerName');

    if (!playerName) {
        playerName = generateName(playerName);
        localStorage.setItem('playerName', playerName);
    }
    inputField.value = playerName;

    inputField.focus();

    changeNameButton.addEventListener('click', () => {
        if (isValidPlayerName(inputField.value.trim())) {
            localStorage.setItem('playerName', inputField.value.trim());
            window.location.href="index.html";
        } else {
            inputField.classList.add('denied');
            errorMessage.textContent = "Допустимый набор символов: A-Z1-9";
            errorMessage.classList.add('visible');
        }
    });


    inputField.addEventListener('input', e => {
        inputField.classList.remove('denied');
        errorMessage.textContent = "";
        errorMessage.classList.remove('visible');
    })


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
