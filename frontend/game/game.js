import {HexCell} from "./hexCell.js";

const hexWidth    = 50;
const hexHeight   = 58;
const hGap        = 2;
const vGap        = 2;
const hSpacing    = hexWidth + hGap;
const vSpacing    = hexHeight - hexHeight / 4 + vGap;
const radius      = 5;

const container           = document.getElementById("game-container");
const pointsDisplay       = document.getElementById("points");
const phaseButton         = document.getElementById("phase-button");
const autoUpgradeButton   = document.getElementById("auto-upgrade");
const currentPlayerDisplay= document.getElementById("current-player");

const players = [
    { color: "blue",  influencePoints: 0, ownedCells: new Set() },
    { color: "red",   influencePoints: 0, ownedCells: new Set() },
    { color: "green", influencePoints: 0, ownedCells: new Set() }
];

let currentPlayerIndex = 0;
let selectedCell       = null;
let capturePhase       = true;

const cubeMap = new Map();

const cubeDirections = [
    { q: +1, r: -1 }, { q: +1, r: 0 }, { q: 0, r: +1 },
    { q: -1, r: +1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
];

function cubeKey(q, r) {
    return `${q},${r}`;
}

function randInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateField(radius, skipChance = 0.2) {
    const cells = [];
    for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
            if (Math.random() < skipChance) continue;
            cells.push({
                q, r,
                s: -q - r,
                power: 0,
                owner: null,
                size: Math.random() < 0.2 ? "big" : "small"
            });
        }
    }
    return cells;
}

function renderHexGrid(cellsData) {
    container.innerHTML = "";
    cubeMap.clear();

    const qs = cellsData.map(c => c.q);
    const rs = cellsData.map(c => c.r);
    const qMin = Math.min(...qs), qMax = Math.max(...qs);
    const rMin = Math.min(...rs), rMax = Math.max(...rs);

    const totalWidth  = (qMax - qMin + 1) * hSpacing + hexWidth;
    const totalHeight = (rMax - rMin + 1) * vSpacing + hexHeight;
    const centerX     = totalWidth  / 2;
    const centerY     = totalHeight / 2;

    container.style.width  = `${totalWidth}px`;
    container.style.height = `${totalHeight}px`;

    for (const data of cellsData) {
        const cell = new HexCell(data, players, hSpacing, vSpacing, centerX, centerY);
        cell.setClickHandler(handleCellClick);
        container.appendChild(cell.wrapper);
        cubeMap.set(cubeKey(data.q, data.r), cell);
    }

    placeStartingCells();
    updateCurrentPlayerDisplay();
}

function placeStartingCells() {
    players.forEach((player, idx) => {
        let cell, key;
        do {
            const q = randInRange(-radius, radius);
            const r = randInRange(Math.max(-radius, -q - radius), Math.min(radius, -q + radius));
            key = cubeKey(q, r);
            cell = cubeMap.get(key);
        } while (!cell || player.ownedCells.has(key));

        cell.setPower(2);
        cell.setOwner(idx);
        player.ownedCells.add(key);
    });
}

function handleCellClick(cell) {
    const player = players[currentPlayerIndex];
    const key    = cubeKey(cell.q, cell.r);

    if (capturePhase) {
        if (player.ownedCells.has(key)) {
            selectCell(cell);
        } else if (selectedCell && canCapture(selectedCell, cell)) {
            captureCell(selectedCell, cell);
        }
    } else {
        if (player.ownedCells.has(key)) {
            upgradeCell(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.deselect();
    }
    clearHighlights();

    if (cell.power > 1) {
        selectedCell = cell;
        cell.select();
        highlightNeighbors(cell);
    }
}

function highlightNeighbors(cell) {
    const player = players[currentPlayerIndex];
    cubeDirections.forEach(dir => {
        const neighbor = cubeMap.get(cubeKey(cell.q + dir.q, cell.r + dir.r));
        if (neighbor && !player.ownedCells.has(cubeKey(neighbor.q, neighbor.r))) {
            neighbor.highlight();
        }
    });
}

function clearHighlights() {
    cubeMap.forEach(c => c.clearHighlight());
}

function canCapture(from, to) {
    const dq = to.q - from.q;
    const dr = to.r - from.r;
    const isNeighbor = cubeDirections.some(d => d.q === dq && d.r === dr);
    const player     = players[currentPlayerIndex];
    const targetKey  = cubeKey(to.q, to.r);
    return isNeighbor && from.power > 1 && !player.ownedCells.has(targetKey);
}

function captureCell(from, to) {
    const player       = players[currentPlayerIndex];
    const fromPower    = from.power;
    const targetPower  = to.power;
    const targetKey    = cubeKey(to.q, to.r);
    const oldOwner     = to.owner;
    const oldOwnerIdx  = oldOwner ? players.indexOf(oldOwner) : null;

    if (!oldOwner || targetPower === 0) {
        to.setPower(fromPower - 1);
        from.setPower(1);
        to.setOwner(currentPlayerIndex);
        player.ownedCells.add(targetKey);
        selectCell(to);

    } else if (oldOwnerIdx !== currentPlayerIndex) {
        const chance = getCaptureChance(fromPower - targetPower);
        if (Math.random() < chance) {
            players[oldOwnerIdx].ownedCells.delete(targetKey);
            to.setOwner(currentPlayerIndex);
            to.setPower(Math.max(fromPower - targetPower, 1));
            from.setPower(1);
            player.ownedCells.add(targetKey);
            if (players[oldOwnerIdx].ownedCells.size === 0) {
                eliminatePlayer(oldOwner);
            }
            selectCell(to);
        } else {
            from.setPower(1);
            to.setPower(Math.max(targetPower - fromPower, 1));
        }
    }
}

function getCaptureChance(diff) {
    if (diff <= -2) return 0;
    if (diff === -1) return 0.25;
    if (diff ===  0) return 0.5;
    if (diff ===  1) return 0.75;
    return 1;
}

function upgradeCell(cell) {
    const player   = players[currentPlayerIndex];
    const maxPower = cell.sizeType === "big" ? 12 : 8;
    if (player.influencePoints > 0 && cell.power < maxPower) {
        cell.setPower(cell.power + 1)
        player.influencePoints--;
        pointsDisplay.textContent = player.influencePoints;
    }
}

function autoUpgrade() {
    const player = players[currentPlayerIndex];
    while (player.influencePoints > 0) {
        const upgradable = [...player.ownedCells]
            .map(key => cubeMap.get(key))
            .filter(c => c.power < (c.sizeType === "big" ? 12 : 8));
        if (upgradable.length === 0) break;
        const choice = upgradable[Math.floor(Math.random() * upgradable.length)];
        upgradeCell(choice);
    }
}

function switchPhase() {
    const player = players[currentPlayerIndex];
    if (capturePhase) {
        capturePhase = false;
        player.influencePoints += player.ownedCells.size;
        pointsDisplay.textContent = player.influencePoints;
        autoUpgradeButton.style.display = "inline-block";
        phaseButton.textContent        = "Передать ход";
    } else {
        capturePhase = true;
        autoUpgradeButton.style.display = "none";
        nextPlayer();
        phaseButton.textContent = "Перейти к фазе прокачки";
    }

    if (selectedCell) {
        selectedCell.deselect();
        selectedCell = null;
    }
    clearHighlights();
    updateCurrentPlayerDisplay();
}

function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayerDisplay();
}

function eliminatePlayer(playerToRemove) {
    const idx = players.indexOf(playerToRemove);
    if (idx === -1) return;

    players.splice(idx, 1);
    if (players.length === 0) {
        alert("Никто не победил.");
        return;
    }
    if (currentPlayerIndex >= idx) {
        currentPlayerIndex = Math.max(0, currentPlayerIndex - 1);
    }

    cubeMap.forEach(cell => {
        if (cell.owner === playerToRemove) {
            cell.setOwner(null)
        }
        cell.updateVisual();
    });

    if (players.length === 1) {
        setTimeout(() => {
            alert(`Победил игрок: ${players[0].color.toUpperCase()}!`);
        }, 100);
    }
}

function updateCurrentPlayerDisplay() {
    const player = players[currentPlayerIndex];
    const nameMap = { blue: "СИНИЙ", red: "КРАСНЫЙ", green: "ЗЕЛЁНЫЙ" };
    currentPlayerDisplay.textContent = nameMap[player.color] || player.color.toUpperCase();
    currentPlayerDisplay.style.color = player.color;
}

phaseButton.addEventListener("click", switchPhase);
autoUpgradeButton.addEventListener("click", autoUpgrade);

renderHexGrid(generateField(radius, 0.2));
