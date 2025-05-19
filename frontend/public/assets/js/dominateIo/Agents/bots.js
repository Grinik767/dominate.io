import {Agent} from "./agent.js";
import {Move} from "../Game/move.js";

const dirs = [
    {q: +1, r: -1}, {q: +1, r: 0}, {q: 0, r: +1},
    {q: -1, r: +1}, {q: -1, r: 0}, {q: 0, r: -1}
];

export class BasicBot extends Agent {
    constructor() {
        super();
    }

    getNeighbors(cell, cells) {
        const neighbors = [];
        for (const d of dirs) {
            const nq = cell.q + d.q, nr = cell.r + d.r;
            const neighbor = cells.find(c => c.q === nq && c.r === nr);
            if (neighbor) neighbors.push(neighbor);
        }
        return neighbors;
    }

    calculateCaptureChance(attacker, defender) {
        const diff = attacker - defender;
        if (diff <= -2) return 0;
        if (diff === -1) return 25;
        if (diff === 0) return 50;
        if (diff === 1) return 75;
        return 100;
    }

    async getMove(state) {
        console.log("getMove")
        const dominatorIndex = state.currentDominatorIndex;
        const dominator = state.dominators[dominatorIndex];

        if (state.capturePhase) {
            return this.getMoveCapturePhase(state, dominator);
        } else {
            return this.getMoveUpgradePhase(state, dominator);
        }
    }

    getMoveCapturePhase(state, dominator) {
        const ownedCells = Array.from(dominator.ownedCells).map(key => {
            const [q, r] = key.split(',').map(Number);
            return state.cells.find(c => c.q === q && c.r === r);
        });

        const possibleMoves = [];

        for (const cell of ownedCells) {
            if (cell.power <= 1) continue;

            const neighbors = this.getNeighbors(cell, state.cells);
            for (const neighbor of neighbors) {
                const isEnemy = neighbor.owner !== null && neighbor.owner.index !== dominator.index;
                const isNeutral = neighbor.owner === null;
                if (!isEnemy && !isNeutral) continue;

                const score = this.evaluateCaptureMove(cell, neighbor, isEnemy, isNeutral, ownedCells.length);
                possibleMoves.push({
                    score,
                    move: new Move('capture', {from : {q: cell.q, r: cell.r}, to: {q: neighbor.q, r: neighbor.r}})
                });
            }
        }

        if (possibleMoves.length > 0) {
            possibleMoves.sort((a, b) => b.score - a.score);
            const topMoves = possibleMoves.slice(0, 5);
            const selected = topMoves[Math.floor(Math.random() * topMoves.length)];
            return selected.move;
        }

        return new Move('endPhase', {})
    }

    getMoveUpgradePhase(state, dominator) {
        if (dominator.influencePoints === 0)
            return new Move('endPhase', {})

        const ownedCells = Array.from(dominator.ownedCells).map(key => {
            const [q, r] = key.split(',').map(Number);
            return state.cells.find(c => c.q === q && c.r === r);
        });
        const upgradePossibilities = [];

        for (const cell of ownedCells) {
            if (cell.power >= cell.size) continue;

            const neighbors = this.getNeighbors(cell, state.cells);
            const score = this.evaluateUpgradeMove(cell, neighbors)
            upgradePossibilities.push({
                score,
                move: new Move('upgrade', {q: cell.q, r: cell.r})
            });
        }

        if (upgradePossibilities.length === 0)
            return new Move('endPhase', {})
        upgradePossibilities.sort((a, b) => b.score - a.score);
        const top = upgradePossibilities.slice(0, 5);
        const selected = top[Math.floor(Math.random() * top.length)];
        return selected.move;
    }

    evaluateCaptureMove(fromCell, toCell, isEnemy, isNeutral, totalOwnedCells) {
        const powerDiff = fromCell.power - toCell.power;
        const chance = this.calculateCaptureChance(fromCell.power, toCell.power);

        let score = 0;
        if (chance === 0) return 0;

        if (isEnemy) {
            score += 30;
            score += powerDiff * 5;
        } else if (isNeutral) {
            score += 15;
            score += powerDiff * 2;
        }

        score += (100 - totalOwnedCells) * 0.2;

        score += Math.random() * 5;

        return score;
    }

    evaluateUpgradeMove(cell, neighbors) {
        if (cell.power >= cell.size) return 0;
        const hasEnemyNear = neighbors.some(neighbour => neighbour.owner !== null && neighbour.owner.index !== cell.owner.index);

        let score = 0;
        if (hasEnemyNear) score += 30;
        score += cell.size === 12 ? 10 : 5;
        score += (1 / (cell.power + 1)) * 20;
        score += Math.random() * 5;

        return score;
    }
}
