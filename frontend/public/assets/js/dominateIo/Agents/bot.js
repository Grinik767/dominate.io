import {Agent} from "./agent.js";

const dirs = [
    {q: +1, r: -1}, {q: +1, r: 0}, {q: 0, r: +1},
    {q: -1, r: +1}, {q: -1, r: 0}, {q: 0, r: -1}
];

export class Bot extends Agent {
    constructor() {
        super();
    }

    /**
     * Called by the dominateIo loop. Returns a promise that resolves when the player makes a move.
     * @returns {Promise<Object>} The move selected by the player.
     */
    async getMove(state) {
        const currentDominator = state.dominators[state.currentDominatorIndex];
        if (state.capturePhase) {
            // найдём все возможные атаки
            for (const cell of state.cells) {
                const key = `${cell.q},${cell.r}`;
                if (currentDominator.ownedCells.has(key)
                    && cell.power > 1) {
                    // проверяем соседей
                    for (const d of dirs) {
                        const nq = cell.q + d.q, nr = cell.r + d.r;
                        const neigh = state.cells.find(c => c.q === nq && c.r === nr);
                        if (neigh && neigh.ownerIndex !== state.currentDominatorIndex) {
                            return {
                                type: 'capture',
                                from: {q: cell.q, r: cell.r},
                                to: {q: nq, r: nr}
                            };
                        }
                    }
                }
            }
            // если атаковать некуда — заканчиваем фазу
            return {type: 'endPhase'};

        } else {
            // фаза прокачки: пока есть очки, просто апгрейдим первую свою
            const owned = [...currentDominator.ownedCells];
            if (currentDominator.influencePoints > 0 && owned.length) {
                const [q, r] = owned[0].split(',').map(Number);
                return {type: 'upgrade', q, r};
            }
            // иначе передаём ход
            return {type: 'endPhase'};
        }
    }
}
