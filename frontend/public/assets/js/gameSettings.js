import {AudioPlayer} from './audioManager.js';
import {makeFadeOut, makeFadeIn, emulateButtonClick} from "./utils.js";

let botLevels = ["Легко", "Средне", "Тяжело"];
let botLevelsColors = ["green", "orange", "red"];
let currentLevelIndex = 1;
let botsCount = 1;
let playerCount = 1;
let fieldSize = 6;

const minCountPlayers = 1;
const maxCountPlayers = 4;

const minCountBots = 0;
const maxCountBots = 4;

const minFiledSize = 3;
const maxFiledSize = 6;

const countBotsEl = document.querySelector('#botsCount .value-number');
const countPlayersEl = document.querySelector('#playerCount .value-number');
const fieldSizeEl = document.querySelector("#fieldSize .value-number");
const levelBotEl = document.getElementById("botsLevel");


const buttonPlayersPlus = document.querySelector('#playerCount .plus');
const buttonPlayersMinus = document.querySelector('#playerCount .minus');

const buttonBotsPlus = document.querySelector('#botsCount .plus');
const buttonBotsMinus = document.querySelector('#botsCount .minus');

const fieldSizePlus = document.querySelector('#fieldSize .plus');
const fieldSizeMinus = document.querySelector('#fieldSize .minus');

const startGameButton = document.querySelector('#startGame');


document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            makeFadeOut();
        }
        else if (e.key === 'Enter') {
            emulateButtonClick(startGameButton);
        }
    });

    levelBotEl.textContent = botLevels[currentLevelIndex];
    levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);

    countBotsEl.textContent = botsCount.toString();
    countPlayersEl.textContent = playerCount.toString();
    fieldSizeEl.textContent = fieldSize.toString();

    levelBotEl.addEventListener("click", () => {
        changeBotsLevel()
        AudioPlayer.playSound('click')
    });

    buttonPlayersPlus.addEventListener("click", () => {
        if (!buttonPlayersPlus.classList.contains('locked'))
            changeCountPlayers(1)

        AudioPlayer.playSound('up')
    });
    buttonPlayersMinus.addEventListener("click", () => {
        if (!buttonPlayersMinus.classList.contains('locked'))
            changeCountPlayers(-1)

        AudioPlayer.playSound('down')
    });
    buttonBotsPlus.addEventListener("click", () => {
        if (!buttonBotsPlus.classList.contains('locked'))
            changeCountBots(1)

        AudioPlayer.playSound('up')
    });
    buttonBotsMinus.addEventListener("click", () => {
        if (!buttonBotsMinus.classList.contains('locked'))
            changeCountBots(-1)

        AudioPlayer.playSound('down')
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

    updateAvailabilityPlayerAndBotsButtons();
    updateAvailabilityFieldSizeButtons();

    const startGameButton = document.getElementById("startGame");
    startGameButton.addEventListener("click", () => {
        window.location.href = `/game.html?players=${playerCount}&bots=${botsCount}&level=${currentLevelIndex}&size=${fieldSize}`;
    })

    makeFadeIn();


});

function changeCountPlayers(delta) {
    let count = playerCount;

    count = Math.min(maxCountPlayers, Math.max(minCountPlayers, count + delta));
    countPlayersEl.textContent = count.toString();

    playerCount = count;

    if (playerCount === minCountPlayers && botsCount === minCountBots) {
        changeCountBots(1);
    }

    updateAvailabilityPlayerAndBotsButtons();
}

function changeCountBots(delta) {
    let count = botsCount;

    count = Math.min(maxCountBots, Math.max(minCountBots, count + delta));
    countBotsEl.textContent = count.toString();

    botsCount = count;
    updateAvailabilityPlayerAndBotsButtons();
}

function updateAvailabilityPlayerAndBotsButtons() {
    buttonPlayersMinus.classList.remove('locked');
    buttonPlayersPlus.classList.remove('locked');
    if (playerCount === maxCountPlayers) {
        buttonPlayersPlus.classList.add('locked');
    } else if (playerCount === minCountPlayers) {
        buttonPlayersMinus.classList.add('locked');
    }

    buttonBotsMinus.classList.remove('locked');
    buttonBotsPlus.classList.remove('locked');
    if (botsCount === maxCountBots) {
        buttonBotsPlus.classList.add('locked');
    } else if (botsCount === minCountBots) {
        buttonBotsMinus.classList.add('locked');
    }

    if (playerCount === 1 && botsCount === 1) {
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

function changeBotsLevel() {
    levelBotEl.classList.remove(botLevelsColors[currentLevelIndex]);
    currentLevelIndex = (currentLevelIndex + 1) % 3;
    levelBotEl.textContent = botLevels[currentLevelIndex];
    levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);
}

function changeFieldSize(delta) {
    let size = fieldSize;

    size = Math.min(maxFiledSize, Math.max(minFiledSize, size + delta));
    fieldSizeEl.textContent = size.toString();

    fieldSize = size;
    updateAvailabilityFieldSizeButtons();
}
