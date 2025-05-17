// Новая hex-сетка с логикой влияния, захвата и прокачки

const hexWidth = 64;
const hexHeight = 74;
const hGap = 2;
const vGap = 2;
const hSpacing = hexWidth + hGap;
const vSpacing = hexHeight - hexHeight / 4 + vGap;
const radius = 5;

const container = document.getElementById("game-container");
const pointsDisplay = document.getElementById("points");
const phaseButton = document.getElementById("phase-button");
const autoUpgradeButton = document.getElementById("auto-upgrade");

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
        const { q, r, s, value, power, owner } = cellData;
        const key = cubeKey(q, r);
        const x = (q + r / 2) * hSpacing + centerX;
        const y = r * vSpacing + centerY;

        const div = document.createElement("div");
        div.className = "hex-cell";
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.textContent = power;
        div.dataset.q = q;
        div.dataset.r = r;
        div.dataset.s = s;
        div.dataset.power = power;
        div.style.userSelect = "none";

        if (owner) {
            div.style.background = owner.color;
        }

        div.addEventListener("click", () => handleCellClick(div));
        container.appendChild(div);
        cubeMap.set(key, div);
    }

    placeStartingCells();
}

function placeStartingCells() {
    for (const player of players) {
        let cell;
        do {
            const q = Math.floor(Math.random() * radius * 2 - radius);
            const r = Math.floor(Math.random() * radius * 2 - radius);
            const key = cubeKey(q, r);
            cell = cubeMap.get(key);
        } while (!cell || cell.dataset.owner);

        cell.dataset.power = 2;
        cell.textContent = "2";
        cell.style.background = player.color;
        player.ownedCells.add(cubeKey(+cell.dataset.q, +cell.dataset.r));
        cell.dataset.owner = currentPlayerIndex;
    }
}

function handleCellClick(cell) {
    const key = cubeKey(+cell.dataset.q, +cell.dataset.r);
    const player = players[currentPlayerIndex];

    console.log("Клик по:", key, player);

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
    if (selectedCell) selectedCell.classList.remove("selected");
    selectedCell = cell;
    selectedCell.classList.add("selected");
}

function canCapture(target) {
    const fromQ = +selectedCell.dataset.q;
    const fromR = +selectedCell.dataset.r;
    const targetQ = +target.dataset.q;
    const targetR = +target.dataset.r;
    const dq = targetQ - fromQ;
    const dr = targetR - fromR;

    return cubeDirections.some(dir => dir.q === dq && dir.r === dr) && (+selectedCell.dataset.power > 1);
}

function captureCell(cell, player) {
    const fromPower = parseInt(selectedCell.dataset.power);
    const targetPower = parseInt(cell.dataset.power);
    const key = cubeKey(+cell.dataset.q, +cell.dataset.r);
    const oldOwnerIndex = cell.dataset.owner;
    const oldOwner = players[oldOwnerIndex];

    if (!cell.dataset.owner) {
        if (fromPower > 1) {
            cell.dataset.power = fromPower - 1;
            selectedCell.dataset.power = 1;
            cell.textContent = cell.dataset.power;
            selectedCell.textContent = "1";
            cell.style.background = player.color;
            player.ownedCells.add(key);
            cell.dataset.owner = currentPlayerIndex;
            selectCell(cell);
        }
    } else if (oldOwner !== player) {
        if (fromPower >= targetPower) {
            const success = fromPower > targetPower || Math.random() < 0.5;
            if (success) {
                oldOwner.ownedCells.delete(key);
                player.ownedCells.add(key);
                cell.style.background = player.color;
                cell.dataset.power = fromPower - 1;
                selectedCell.dataset.power = 1;
                cell.textContent = cell.dataset.power;
                selectedCell.textContent = "1";
                cell.dataset.owner = currentPlayerIndex;
                selectCell(cell);
            } else {
                selectedCell.dataset.power = "1";
                selectedCell.textContent = "1";
            }
        } else {
            cell.dataset.power = targetPower - (fromPower - 1);
            selectedCell.dataset.power = "1";
            cell.textContent = cell.dataset.power;
            selectedCell.textContent = "1";
        }
    }
}

function switchPhase() {
    const player = players[currentPlayerIndex];
    if (capturePhase) {
        capturePhase = false;
        player.influencePoints += player.ownedCells.size;
        pointsDisplay.textContent = player.influencePoints;
        autoUpgradeButton.style.display = "inline-block";
        phaseButton.textContent = "Передать ход";
        if (selectedCell) selectedCell.classList.remove("selected");
        selectedCell = null;
    } else {
        capturePhase = true;
        autoUpgradeButton.style.display = "none";
        nextPlayer();
    }
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    phaseButton.textContent = "Перейти к фазе прокачки";
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

phaseButton.addEventListener("click", switchPhase);
autoUpgradeButton.addEventListener("click", autoUpgrade);

renderHexGrid(generateField(radius, 0.1));
