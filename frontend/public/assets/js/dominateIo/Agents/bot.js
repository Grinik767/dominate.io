import {Agent} from "./agent.js";
import {Move} from "../Game/move.js";
import {directions, sleep} from "../globals.js";

export class Bot extends Agent {
    constructor() {
        super();
    }

    /**
     * Called by the dominateIo loop. Returns a promise that resolves when the player makes a move.
     * @returns {Promise<Object>} The move selected by the player.
     */
    async getMove(state) {
        await sleep(700);

        const currentDominator = state.dominators[state.currentDominatorIndex];
        if (state.capturePhase) {
            // найдём все возможные атаки
            for (const cell of state.cells) {
                const key = `${cell.q},${cell.r}`;
                if (currentDominator.ownedCells.has(key)
                    && cell.power > 1) {
                    // проверяем соседей
                    for (const d of directions) {
                        const nq = cell.q + d.q, nr = cell.r + d.r;
                        const neigh = state.cells.find(c => c.q === nq && c.r === nr);
                        if (neigh && (neigh.owner == null || neigh.owner.index !== state.currentDominatorIndex)) {
                            return new Move(
                                'capture', {
                                    from: {q: cell.q, r: cell.r},
                                    to: {q: nq, r: nr}
                                });
                        }
                    }
                }
            }
            // если атаковать некуда — заканчиваем фазу
            return new Move('endPhase');

        } else {
            // фаза прокачки: пока есть очки, просто апгрейдим первую свою
            const owned = [...currentDominator.ownedCells];
            if (currentDominator.influencePoints > 0 && owned.length) {
                const [q, r] = owned[0].split(',').map(Number);
                return new Move('upgrade', {q, r});
            }
            // иначе передаём ход
            return new Move('endPhase');
        }
    }
}
