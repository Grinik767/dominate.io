let botLevels = ["Легко", "Средне", "Тяжело"];
let botLevelsColors = ["green", "orange", "red"];
let currentLevelIndex = 1;
let botsCount = 1;
let playerCount = 1;

const minCountPlayers = 1;
const maxCountPlayers = 4;

const minCountBots = 0;
const maxCountBots = 4;

const countBotsEl = document.querySelector('#botsCount .value-number');
const countPlayersEl = document.querySelector('#playerCount .value-number');
const buttonPlayersPlus = document.querySelector('#playerCount .plus');
const buttonPlayersMinus = document.querySelector('#playerCount .minus');
const buttonBotsPlus = document.querySelector('#botsCount .plus');
const buttonBotsMinus = document.querySelector('#botsCount .minus');
const levelBotEl = document.getElementById("botsLevel");

document.addEventListener("DOMContentLoaded", () => {
    levelBotEl.textContent = botLevels[currentLevelIndex];
    levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);

    countBotsEl.textContent = botsCount.toString();
    countPlayersEl.textContent = playerCount.toString();

    levelBotEl.addEventListener("click", changeBotsLevel);

    buttonPlayersPlus.addEventListener("click", () => {
        if (!buttonPlayersPlus.classList.contains('locked'))
            changeCountPlayers(1)
    });
    buttonPlayersMinus.addEventListener("click", () => {
        if (!buttonPlayersMinus.classList.contains('locked'))
            changeCountPlayers(-1)
    });
    buttonBotsPlus.addEventListener("click", () => {
        if (!buttonBotsPlus.classList.contains('locked'))
            changeCountBots(1)
    });
    buttonBotsMinus.addEventListener("click", () => {
        if (!buttonBotsMinus.classList.contains('locked'))
            changeCountBots(-1)
    });

    updateAvailabilityButtons();

    const startGameButton = document.getElementById("startGame");
    startGameButton.addEventListener("click", () => {
        window.location.href = `/game.html?players=${playerCount}&bots=${botsCount}&level=${currentLevelIndex}`;
    })
});

function changeCountPlayers(delta) {
    let count = playerCount;

    count = Math.min(maxCountPlayers, Math.max(minCountPlayers, count + delta));
    countPlayersEl.textContent = count.toString();

    playerCount = count;

    if (playerCount === minCountPlayers && botsCount === minCountBots) {
        changeCountBots(1);
    }

    updateAvailabilityButtons();
}

function changeCountBots(delta) {
    let count = botsCount;

    count = Math.min(maxCountBots, Math.max(minCountBots, count + delta));
    countBotsEl.textContent = count.toString();

    botsCount = count;
    updateAvailabilityButtons();
}

function updateAvailabilityButtons() {
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

function changeBotsLevel() {
    levelBotEl.classList.remove(botLevelsColors[currentLevelIndex]);
    currentLevelIndex = (currentLevelIndex + 1) % 3;
    levelBotEl.textContent = botLevels[currentLevelIndex];
    levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);
}

