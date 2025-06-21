import {Cell} from "./cell.js";
import {DEFAULT_SIZE, BIG_SIZE} from "../globals.js";
import {GameState} from "./gameState.js";

export function generateField(radius, dominators) {
    const allCells = new Map(); // Keyed by 'q,r,s'
    for (let q = -radius; q <= radius; q++) {
        for (
            let r = Math.max(-radius, -q - radius);
            r <= Math.min(radius, -q + radius);
            r++
        ) {
            const s = -q - r;
            const key = `${q},${r},${s}`;
            const cell = new Cell(q, r, s, Math.random() < 0.2 ? BIG_SIZE : DEFAULT_SIZE);
            if (Math.random() >= 0.2) {
                allCells.set(key, cell);
            }
        }
    }

    const visited = new Set();
    let largestGroup = [];

    const directions = [
        [+1, -1, 0], [-1, +1, 0],
        [+1, 0, -1], [-1, 0, +1],
        [0, +1, -1], [0, -1, +1]
    ];

    for (const [key, startCell] of allCells) {
        if (visited.has(key)) continue;

        const queue = [startCell];
        const group = [];
        visited.add(key);

        while (queue.length > 0) {
            const current = queue.pop();
            group.push(current);
            const neighbors = directions.map(([dq, dr, ds]) => {
                const nq = current.q + dq;
                const nr = current.r + dr;
                const ns = current.s + ds;
                return allCells.get(`${nq},${nr},${ns}`);
            }).filter(n => n && !visited.has(`${n.q},${n.r},${n.s}`));

            for (const neighbor of neighbors) {
                visited.add(`${neighbor.q},${neighbor.r},${neighbor.s}`);
                queue.push(neighbor);
            }
        }

        if (group.length > largestGroup.length) {
            largestGroup = group;
        }
    }

    const state = new GameState(largestGroup, dominators);
    placeStartingCells(state)

    return state;
}

function placeStartingCells(state) {
    /**
     * Метод расположения начальных позиций игроков
     * с равномерным расстоянием между ними
     */
    const getHexDistance = (a, b) => {
        return Math.max(
            Math.abs(a.q - b.q),
            Math.abs(a.q + a.r - b.q - b.r),
            Math.abs(a.r - b.r)
        );
    };

    const availableCells = state.cells.filter(cell => cell.owner == null);
    const selectedCells = [];

    state.dominators.forEach((dominator, idx) => {
        let bestCell = null;
        let bestMinDistance = -1;

        if (idx === 0) {
            bestCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        } else {
            for (const cell of availableCells) {
                if (cell.owner != null) continue;

                const minDist = selectedCells.reduce((min, other) => {
                    const dist = getHexDistance(cell, other);
                    return Math.min(min, dist);
                }, Infinity);

                if (minDist > bestMinDistance) {
                    bestMinDistance = minDist;
                    bestCell = cell;
                }
            }
        }

        if (bestCell) {
            bestCell.owner = dominator;
            bestCell.power = 2;
            dominator.ownedCells.add(`${bestCell.q},${bestCell.r}`);
            selectedCells.push(bestCell);

            const index = availableCells.indexOf(bestCell);
            if (index > -1) availableCells.splice(index, 1);
        }
    });
}
