import { HexCell } from './hexCell.js';
import { Button, Display, GameBoard } from './ui.js';

const hexWidth  = 50;
const hexHeight = 58;
const hGap      = 2;
const vGap      = 2;
const hSpacing  = hexWidth + hGap;
const vSpacing  = hexHeight - hexHeight/4 + vGap;
const radius    = 5;

const board                  = new GameBoard('game-container');
const switchPhaseButton      = new Button('phase-button');
const autoUpgradeButton      = new Button('auto-upgrade');
const powerPointsLabel       = new Display('points');
const currentPlayerLabel     = new Display('player-color-name');

switchPhaseButton.onClick(switchPhase);
autoUpgradeButton.onClick(autoUpgrade);

autoUpgradeButton.hide();

const players = [
    { color: 'blue',  influencePoints: 0, ownedCells: new Set() },
    { color: 'red',   influencePoints: 0, ownedCells: new Set() },
    { color: 'green', influencePoints: 0, ownedCells: new Set() }
];

let currentPlayerIndex = 0;
let selectedCell       = null;
let capturePhase       = true;

const cubeMap = new Map();
const cubeDirections = [
    { q:+1, r:-1 }, { q:+1, r:0 }, { q:0, r:+1 },
    { q:-1, r:+1}, { q:-1, r:0 }, { q:0, r:-1 }
];

function cubeKey(q, r) {
    return `${q},${r}`;
}

function randInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateField(radius, skipChance = 0.2) {
    const arr = [];
    for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q-radius); r <= Math.min(radius, -q+radius); r++) {
            if (Math.random() < skipChance) continue;
            arr.push({
                q, r, s: -q - r,
                power: 0,
                owner: null,
                size: Math.random() < 0.2 ? 'big' : 'small'
            });
        }
    }
    return arr;
}

function renderHexGrid(cells) {
    board.clear();
    cubeMap.clear();

    const qs = cells.map(c => c.q);
    const rs = cells.map(c => c.r);
    const qMin = Math.min(...qs), qMax = Math.max(...qs);
    const rMin = Math.min(...rs), rMax = Math.max(...rs);

    const totalW = (qMax - qMin + 1) * hSpacing + hexWidth;
    const totalH = (rMax - rMin + 1) * vSpacing + hexHeight;
    const cx = totalW / 2, cy = totalH / 2;
    board.setSize(totalW, totalH);

    for (const data of cells) {
        const cell = new HexCell(data, players, hSpacing, vSpacing, cx, cy);
        cell.setClickHandler(handleCellClick);
        board.append(cell.wrapper);
        cubeMap.set(cubeKey(data.q, data.r), cell);
    }

    placeStartingCells();
    updateCurrentPlayerDisplay();
}

function placeStartingCells() {
    players.forEach((pl, idx) => {
        let cell, key;
        do {
            const q = randInRange(-radius, radius);
            const r = randInRange(Math.max(-radius, -q-radius), Math.min(radius, -q+radius));
            key = cubeKey(q, r);
            cell = cubeMap.get(key);
        } while (!cell || pl.ownedCells.has(key));

        cell.setPower(2);
        cell.setOwner(idx);
        pl.ownedCells.add(key);
    });
}

function handleCellClick(cell) {
    const pl  = players[currentPlayerIndex];
    const key = cubeKey(cell.q, cell.r);

    if (capturePhase) {
        if (pl.ownedCells.has(key)) {
            selectCell(cell);
        } else if (selectedCell && canCapture(selectedCell, cell)) {
            captureCell(selectedCell, cell);
        }
    } else {
        if (pl.ownedCells.has(key)) {
            upgradeCell(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) selectedCell.deselect();
    clearHighlights();

    if (cell.power > 1) {
        selectedCell = cell;
        cell.select();
        highlightNeighbors(cell);
    }
}

function highlightNeighbors(cell) {
    const pl = players[currentPlayerIndex];
    cubeDirections.forEach(dir => {
        const neighbor = cubeMap.get(cubeKey(cell.q + dir.q, cell.r + dir.r));
        if (neighbor && !pl.ownedCells.has(cubeKey(neighbor.q, neighbor.r))) {
            neighbor.highlight();
        }
    });
}

function clearHighlights() {
    cubeMap.forEach(c => c.clearHighlight());
}

function canCapture(from, to) {
    const dq     = to.q - from.q;
    const dr     = to.r - from.r;
    const neigh  = cubeDirections.some(d => d.q === dq && d.r === dr);
    const pl     = players[currentPlayerIndex];
    const target = cubeKey(to.q, to.r);
    return neigh && from.power > 1 && !pl.ownedCells.has(target);
}

function captureCell(from, to) {
    const pl = players[currentPlayerIndex];
    const fromPower = from.power;
    const toPower = to.power;
    const key = cubeKey(to.q, to.r);
    const oldIdx = to.ownerIndex;

    if (oldIdx == null || toPower === 0) {
        to.setPower(fromPower - 1);
        from.setPower(1);
        to.setOwner(currentPlayerIndex);
        pl.ownedCells.add(key);
    }
    else if (oldIdx !== currentPlayerIndex) {
        const chance = getCaptureChance(fromPower - toPower);
        if (Math.random() < chance) {
            players[oldIdx].ownedCells.delete(key);
            to.setOwner(currentPlayerIndex);
            to.setPower(Math.max(fromPower - toPower, 1));
            from.setPower(1);
            pl.ownedCells.add(key);

            if (players[oldIdx].ownedCells.size === 0) {
                eliminatePlayer(oldIdx);
            }
        }
        else {
            from.setPower(1);
            to.setPower(Math.max(toPower - fromPower, 1));
        }
    }

    if (to.ownerIndex === currentPlayerIndex) selectCell(to);
}

function getCaptureChance(d) {
    if (d <= -2) return 0;
    else if (d === -1) return 0.25;
    else if (d ===  0) return 0.5;
    else if (d ===  1) return 0.75;

    return 1;
}

function upgradeCell(cell) {
    const pl   = players[currentPlayerIndex];
    const maxP = cell.sizeType === 'big' ? 12 : 8;
    if (pl.influencePoints > 0 && cell.power < maxP) {
        cell.setPower(cell.power + 1);
        pl.influencePoints--;
        powerPointsLabel.setText(pl.influencePoints);
    }
}

function autoUpgrade() {
    const pl = players[currentPlayerIndex];
    while (pl.influencePoints > 0) {
        const upg = [...pl.ownedCells]
            .map(k => cubeMap.get(k))
            .filter(c => c.power < (c.sizeType === 'big' ? 12 : 8));
        if (!upg.length) break;
        upgradeCell(upg[Math.floor(Math.random() * upg.length)]);
    }
}

function switchPhase() {
    const pl = players[currentPlayerIndex];

    if (capturePhase) {
        capturePhase = false;
        pl.influencePoints += pl.ownedCells.size;
        powerPointsLabel.setText(pl.influencePoints);
        autoUpgradeButton.show();
        switchPhaseButton.setText('Передать ход');
    } else {
        capturePhase = true;
        autoUpgradeButton.hide();
        nextPlayer();
        switchPhaseButton.setText('Перейти к фазе прокачки');
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

function eliminatePlayer(idx) {
    players.splice(idx, 1);

    if (currentPlayerIndex >= idx) {
        currentPlayerIndex = Math.max(0, currentPlayerIndex - 1);
    }

    cubeMap.forEach(cell => {
        if (cell.ownerIndex === idx) {
            cell.clearOwner();
        }
        else if (cell.ownerIndex > idx) {
            cell.setOwner(cell.ownerIndex - 1);
        }
    });

    if (players.length === 1) {
        setTimeout(() => {
            alert(`Победил игрок: ${players[0].color.toUpperCase()}!`);
        }, 100);
    }
}

function updateCurrentPlayerDisplay() {
    const p = players[currentPlayerIndex];
    const names = { blue:'СИНИЙ', red:'КРАСНЫЙ', green:'ЗЕЛЁНЫЙ' };

    currentPlayerLabel.setText(names[p.color] || p.color.toUpperCase());
    currentPlayerLabel.setColor(p.color);
    powerPointsLabel.setText(p.influencePoints);
}

renderHexGrid(generateField(radius, 0.2));
