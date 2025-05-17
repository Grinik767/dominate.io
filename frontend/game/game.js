const hexWidth = 50;
const hexHeight = 58;
const hGap = 2;
const vGap = 2;
const hSpacing = hexWidth + hGap;
const vSpacing = hexHeight - hexHeight / 4 + vGap;
const radius = 5;

const container = document.getElementById("game-container");
const pointsDisplay = document.getElementById("points");
const phaseButton = document.getElementById("phase-button");
const autoUpgradeButton = document.getElementById("auto-upgrade");
const currentPlayerDisplay = document.getElementById("current-player");

const players = [
    { color: "blue", influencePoints: 0, ownedCells: new Set() },
    { color: "red", influencePoints: 0, ownedCells: new Set() },
    { color: "green", influencePoints: 0, ownedCells: new Set() }
];

let currentPlayerIndex = 0;
let selectedCell = null;
let capturePhase = true;
const cubeMap = new Map();

const cubeDirections = [
    { q: +1, r: -1 }, { q: +1, r: 0 }, { q: 0, r: +1 },
    { q: -1, r: +1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
];

function cubeKey(q, r) {
    return `${q},${r}`;
}

function generateField(radius, skipChance = 0.2) {
    const cells = [];
    for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
            if (Math.random() < skipChance) continue;
            const s = -q - r;
            cells.push({ q, r, s, value: "0", power: 0, owner: null });
        }
    }
    return cells;
}

function renderHexGrid(cells) {
    container.innerHTML = "";
    cubeMap.clear();

    const qVals = cells.map(c => c.q);
    const rVals = cells.map(c => c.r);
    const qMin = Math.min(...qVals);
    const qMax = Math.max(...qVals);
    const rMin = Math.min(...rVals);
    const rMax = Math.max(...rVals);

    const totalWidth = (qMax - qMin + 1) * hSpacing + hexWidth;
    const totalHeight = (rMax - rMin + 1) * vSpacing + hexHeight;
    const centerX = totalWidth / 2;
    const centerY = totalHeight / 2;

    container.style.width = `${totalWidth}px`;
    container.style.height = `${totalHeight}px`;

    for (const cellData of cells) {
        const { q, r, s, value, power, owner, size = "small" } = cellData;
        const key = cubeKey(q, r);
        const x = (q + r / 2) * hSpacing + centerX;
        const y = r * vSpacing + centerY;

        // Обёртка hex-wrapper (рамка)
        const wrapper = document.createElement("div");
        wrapper.className = "hex-wrapper";
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;

        // Вложенный hex-cell (сам гекс)
        const cell = document.createElement("div");
        cell.className = "hex-cell";
        cell.textContent = power;
        cell.dataset.q = q;
        cell.dataset.r = r;
        cell.dataset.s = s;
        cell.dataset.power = power;
        cell.dataset.size = size;

        if (owner) {
            cell.style.background = owner.color;
        }

        cell.addEventListener("click", () => handleCellClick(cell));

        wrapper.appendChild(cell);
        container.appendChild(wrapper);

        cubeMap.set(key, cell);
    }

    placeStartingCells();
    updateCurrentPlayerDisplay();
}


function placeStartingCells() {
    players.forEach((player, i) => {
        let cell;
        let key;
        do {
            const q = Math.floor(Math.random() * radius * 2 - radius);
            const r = Math.floor(Math.random() * radius * 2 - radius);
            key = cubeKey(q, r);
            cell = cubeMap.get(key);
        } while (!cell || cell.dataset.owner);

        cell.dataset.power = 2;
        cell.textContent = "2";
        cell.dataset.owner = i;
        cell.style.background = player.color;
        player.ownedCells.add(key);
    });
}

function handleCellClick(cell) {
    const key = cubeKey(+cell.dataset.q, +cell.dataset.r);
    const player = players[currentPlayerIndex];

    if (capturePhase) {
        if (player.ownedCells.has(key)) {
            selectCell(cell);
        } else if (selectedCell && canCapture(cell)) {
            captureCell(cell, player);
        }
    } else {
        if (player.ownedCells.has(key)) {
            upgradeCell(cell, player);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        const wrapper = selectedCell.parentElement;
        wrapper.classList.remove("selected");
        selectedCell.classList.remove("selected");
    }

    clearHighlights();

    const power = parseInt(cell.dataset.power, 10);
    if (power > 1) {
        selectedCell = cell;
        selectedCell.classList.add("selected");

        const wrapper = selectedCell.parentElement;
        wrapper.classList.add("selected");

        highlightNeighbors(cell);
    }
}


function canCapture(target) {
    const fromQ = +selectedCell.dataset.q;
    const fromR = +selectedCell.dataset.r;
    const toQ = +target.dataset.q;
    const toR = +target.dataset.r;

    const dq = toQ - fromQ;
    const dr = toR - fromR;

    const isNeighbor = cubeDirections.some(dir => dir.q === dq && dir.r === dr);
    const attackerPower = +selectedCell.dataset.power;
    const targetKey = cubeKey(toQ, toR);
    const isOwn = players[currentPlayerIndex].ownedCells.has(targetKey);
    console.log()

    return isNeighbor && attackerPower > 1 && !isOwn;
}

function captureCell(cell, player) {
    const fromPower = +selectedCell.dataset.power;
    const targetPower = +cell.dataset.power;
    const key = cubeKey(+cell.dataset.q, +cell.dataset.r);
    const oldOwnerIndex = cell.dataset.owner;
    const oldOwner = players[oldOwnerIndex];

    const isOwned = !!cell.dataset.owner;
    const isEnemy = isOwned && oldOwner !== player;
    const isEmpty = !isOwned || targetPower === 0;

    if (isEmpty) {
        attemptCaptureEmpty(cell, player, fromPower, key);
    } else if (isEnemy) {
        attemptCaptureEnemy(cell, player, oldOwner, fromPower, targetPower, key);
    }

    if (+cell.dataset.power <= 0) {
        clearCell(cell, key, oldOwner);
    }
}

function attemptCaptureEmpty(cell, player, fromPower, key) {
    if (fromPower <= 1) return;

    cell.dataset.power = fromPower - 1;
    selectedCell.dataset.power = 1;

    cell.textContent = cell.dataset.power;
    selectedCell.textContent = "1";

    cell.style.background = player.color;
    player.ownedCells.add(key);
    cell.dataset.owner = currentPlayerIndex;

    selectCell(cell);
}

function attemptCaptureEnemy(cell, player, oldOwner, fromPower, targetPower, key) {
    const chance = getCaptureChance(fromPower - targetPower);

    if (Math.random() < chance) {
        oldOwner.ownedCells.delete(key);
        player.ownedCells.add(key);
        cell.dataset.owner = currentPlayerIndex;
        cell.style.background = player.color;

        cell.dataset.power = fromPower - 1;
        selectedCell.dataset.power = 1;
        cell.textContent = cell.dataset.power;
        selectedCell.textContent = "1";

        if (oldOwner && oldOwner.ownedCells.size === 0) {
            eliminatePlayer(oldOwner);
        }

        selectCell(cell);
    } else {
        selectedCell.dataset.power = "1";
        selectedCell.textContent = "1";
    }
}

function getCaptureChance(diff) {
    if (diff <= -2) return 0;
    if (diff === -1) return 0.25;
    if (diff === 0) return 0.5;
    if (diff === 1) return 0.75;
    return 1;
}

function clearCell(cell, key, oldOwner) {
    delete cell.dataset.owner;
    cell.textContent = "0";
    cell.dataset.power = "0";
    cell.style.background = "#111";

    if (oldOwner) oldOwner.ownedCells.delete(key);
}

function switchPhase() {
    const player = players[currentPlayerIndex];

    if (capturePhase) {
        capturePhase = false;
        player.influencePoints += player.ownedCells.size;
        pointsDisplay.textContent = player.influencePoints;
        autoUpgradeButton.style.display = "inline-block";
        phaseButton.textContent = "Передать ход";
    } else {
        capturePhase = true;
        autoUpgradeButton.style.display = "none";
        nextPlayer();
        phaseButton.textContent = "Перейти к фазе прокачки";
    }

    if (selectedCell) {
        const wrapper = selectedCell.parentElement;
        wrapper.classList.remove("selected");
        selectedCell.classList.remove("selected");
        selectedCell = null;
    }

    clearHighlights();
    updateCurrentPlayerDisplay();
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    phaseButton.textContent = "Перейти к фазе прокачки";
    updateCurrentPlayerDisplay();
}

function eliminatePlayer(playerToRemove) {
    const index = players.indexOf(playerToRemove);
    if (index === -1) return;

    players.splice(index, 1);

    if (players.length === 0) {
        alert("Никто не победил. Все проиграли.");
        return;
    }

    if (currentPlayerIndex >= index) {
        currentPlayerIndex = Math.max(0, currentPlayerIndex - 1);
    }

    cubeMap.forEach(cell => {
        const ownerIndex = +cell.dataset.owner;
        if (ownerIndex > index) {
            cell.dataset.owner = ownerIndex - 1;
        } else if (ownerIndex === index) {
            delete cell.dataset.owner;
        }
    });

    if (players.length === 1) {
        setTimeout(() => {
            alert(`Победил игрок: ${players[0].color.toUpperCase()}!`);
        }, 100);
    }
}

function upgradeCell(cell, player) {
    if (player.influencePoints > 0 && parseInt(cell.dataset.power) < 10) {
        cell.dataset.power++;
        cell.textContent = cell.dataset.power;
        player.influencePoints--;
        pointsDisplay.textContent = player.influencePoints;
    }
}

function autoUpgrade() {
    const player = players[currentPlayerIndex];
    while (player.influencePoints > 0) {
        const upgradableCells = [...player.ownedCells]
            .map(k => cubeMap.get(k))
            .filter(c => parseInt(c.dataset.power) < 10);
        if (upgradableCells.length === 0) break;
        const randomCell = upgradableCells[Math.floor(Math.random() * upgradableCells.length)];
        upgradeCell(randomCell, player);
    }
}

function updateCurrentPlayerDisplay() {
    if (currentPlayerDisplay) {
        const color = players[currentPlayerIndex].color;
        const name = {
            blue: "СИНИЙ",
            red: "КРАСНЫЙ",
            green: "ЗЕЛЁНЫЙ"
        }[color] || color.toUpperCase();

        const playerColorName = document.getElementById("player-color-name");
        if (playerColorName) {
            playerColorName.textContent = name;
            playerColorName.style.color = color;
        }
    }
}

function highlightNeighbors(cell) {
    const q = +cell.dataset.q;
    const r = +cell.dataset.r;
    const player = players[currentPlayerIndex];

    cubeDirections.forEach(dir => {
        const neighborKey = cubeKey(q + dir.q, r + dir.r);
        const neighbor = cubeMap.get(neighborKey);

        if (!neighbor) return;

        if (player.ownedCells.has(neighborKey)) return;

        neighbor.parentElement.classList.add("highlight");
    });
}

function clearHighlights() {
    container.querySelectorAll(".highlight").forEach(c => c.classList.remove("highlight"));
}

phaseButton.addEventListener("click", switchPhase);
autoUpgradeButton.addEventListener("click", autoUpgrade);

renderHexGrid(generateField(radius, 0.1));
