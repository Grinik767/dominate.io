import {backendPreffix} from "./dominateIo/globals.js";
import {generateField} from "./dominateIo/Game/field.js";

let playerCount = 2;

const minCountPlayers = 2;
const maxCountPlayers = 4;

const countPlayersEl = document.querySelector('.value-number');

const plusButton = document.querySelector('.plus');
const minusButton = document.querySelector('.minus');

document.addEventListener("DOMContentLoaded", () => {
    countPlayersEl.textContent = playerCount.toString();

plusButton.addEventListener("click", () => {
        if (!plusButton.classList.contains('locked'))
            changeCountPlayers(1)
    });

    minusButton.addEventListener("click", () => {
        if (!minusButton.classList.contains('locked'))
            changeCountPlayers(-1)
    });

    updateAvailability();

    const startGameButton = document.getElementById("createLobby");
    startGameButton.addEventListener("click", createLobby);
});

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

async function createLobby() {
    try {
        console.log("Creating Lobby");
        const dominators = Array.from({length: playerCount},
            (_, i) => ({index: i, ownedCells: new Set()}))
        const field = generateField(1, dominators);
        const cells = field.toCells();
        console.log(JSON.stringify({ playersCount: playerCount, field: cells}))

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
        console.log("Lobby code:", data.code)
    } catch (error) {
        window.location.href = '/error.html';
    }
}
