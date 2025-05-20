let botLevels = ["Легко", "Средне", "Тяжело"];
let botLevelsColors = ["green", "orange", "red"];
let currentLevelIndex = 1;
let botsCount = 0;
let playerCount = 1;

const minCountPlayers = 1;
const maxCountPlayers = 4;

const minCountBots = 0;
const maxCountBots = 4;


document.addEventListener("DOMContentLoaded", () => {
    const levelBotEl = document.getElementById("botsLevel");
    const botsCountEl = document.getElementById("botsCount");
    const playerCountEl = document.getElementById("playerCount");

    levelBotEl.textContent = botLevels[currentLevelIndex];
    levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);

    botsCountEl.textContent = botsCount;
    playerCountEl.textContent = playerCount;

    levelBotEl.addEventListener("click", () => {
        levelBotEl.classList.remove(botLevelsColors[currentLevelIndex]);
        currentLevelIndex = (currentLevelIndex + 1) % 3;
        levelBotEl.textContent = botLevels[currentLevelIndex];
        levelBotEl.classList.add(botLevelsColors[currentLevelIndex]);
    })

    const startGameButton = document.getElementById("startGame");
    startGameButton.addEventListener("click", () => {


        window.location.href = `/game.html?players=${playerCount}&bots=${botsCount}&level=${currentLevelIndex}`;
    })
});

function changeCount(delta, id) {
    const countEl = document.getElementById(id);
    let count = parseInt(countEl.textContent);

    const min = id === "botsCount" ? minCountBots: minCountPlayers;
    const max = id === "botsCount" ? maxCountBots: maxCountPlayers;

    count = Math.min(max, Math.max(min, count + delta));
    countEl.textContent = count.toString();

    if (id === "botsCount"){
        botsCount = count;
    } else if (id === "playerCount"){
        playerCount = count;
    }
}

function changeBotsLevel(delta) {
    const levelEl = document.getElementById("botsLevel");
    currentLevelIndex = (currentLevelIndex + delta + botLevels.length) % botLevels.length;
    levelEl.textContent = botLevels[currentLevelIndex];
}