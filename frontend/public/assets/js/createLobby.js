import {backendPreffix} from "./dominateIo/globals.js";
import {generateField} from "./dominateIo/Game/field.js";
import {makeFadeOut, makeFadeIn, emulateButtonClick} from "./utils.js";
import {AudioPlayer} from "./audioManager.js";

let playerCount = 2;
let startGameButton;
let fieldSize = 6;

const minCountPlayers = 2;
const maxCountPlayers = 8;

const minFiledSize = 3;
const maxFiledSize = 7;

const countPlayersEl = document.querySelector('.value-number');
const fieldSizeEl = document.querySelector("#fieldSize .value-number");


const plusButton = document.querySelector('.plus');
const minusButton = document.querySelector('.minus');

const fieldSizePlus = document.querySelector('#fieldSize .plus');
const fieldSizeMinus = document.querySelector('#fieldSize .minus');


document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            makeFadeOut();
        }
    });

    countPlayersEl.textContent = playerCount.toString();
    fieldSizeEl.textContent = fieldSize.toString();

    plusButton.addEventListener("click", () => {
        if (!plusButton.classList.contains('locked'))
            changeCountPlayers(1)
    });

    minusButton.addEventListener("click", () => {
        if (!minusButton.classList.contains('locked'))
            changeCountPlayers(-1)
    });

    fieldSizePlus.addEventListener("click", () => {
        if (!fieldSizePlus.classList.contains('locked'))
            changeFieldSize(1)

        AudioPlayer.playSound('up')
    });

    fieldSizeMinus.addEventListener("click", () => {
        if (!fieldSizeMinus.classList.contains('locked'))
            changeFieldSize(-1);

        AudioPlayer.playSound('down')
    });

    updateAvailability();
    updateAvailabilityFieldSizeButtons();

    startGameButton = document.getElementById("createLobby");
    startGameButton.addEventListener("click", createLobby);

    makeFadeIn();
});

function changeFieldSize(delta) {
    let size = fieldSize;

    size = Math.min(maxFiledSize, Math.max(minFiledSize, size + delta));
    fieldSizeEl.textContent = size.toString();

    fieldSize = size;
    updateAvailabilityFieldSizeButtons();
}


function changeCountPlayers(delta) {
    let count = playerCount;

    count = Math.min(maxCountPlayers, Math.max(minCountPlayers, count + delta));
    countPlayersEl.textContent = count.toString();

    playerCount = count;

    updateAvailability();
}

function updateAvailability() {
    minusButton.classList.remove('locked');
    plusButton.classList.remove('locked');
    if (playerCount === maxCountPlayers) {
        plusButton.classList.add('locked');
    } else if (playerCount === minCountPlayers) {
        minusButton.classList.add('locked');
    }

    if (playerCount === 1) {
        buttonBotsMinus.classList.add('locked');
    }
}

function updateAvailabilityFieldSizeButtons() {
    fieldSizeMinus.classList.remove('locked');
    fieldSizePlus.classList.remove('locked');
    if (fieldSize === maxFiledSize) {
        fieldSizePlus.classList.add('locked');
    } else if (fieldSize === minFiledSize) {
        fieldSizeMinus.classList.add('locked');
    }
}


async function createLobby() {
    try {
        console.log("Creating Lobby");
        const dominators = Array.from({length: playerCount},
            (_, i) => ({index: i, ownedCells: new Set()}))
        const field = generateField(fieldSize, dominators);
        const cells = field.toCells();
        const LobbyInfo = {
            playersCount: playerCount,
            field: JSON.stringify(cells)
        }

        const response = await fetch(backendPreffix + '/Lobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playersCount: playerCount, field: cells}),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        sessionStorage.setItem('LobbyInfo', JSON.stringify(LobbyInfo));
        window.location.href = `/lobby.html?code=${data.code}`;
    } catch (error) {
        console.log(error);
        window.location.href = '/error.html';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        emulateButtonClick(startGameButton);
    }
});