import {Agent} from "./agent.js";

/**
 * Представляет агента-игрока (человека), который совершает ходы через пользовательский интерфейс.
 */
export class Player extends Agent {
    constructor() {
        super();
        this._resolve = null;
    }

    /**
     * Вызывается циклом dominateIo. Возвращает промис, который завершается, как только игрок совершает ход.
     * @returns {Promise<Object>} Объект выбранного игроком хода.
     */
    async getMove(state) {
        return new Promise((resolve) => {
            this._resolveMove = resolve;
        });
    }

    /**
     * Вызывается со стороны пользовательского интерфейса при выборе игроком хода.
     * @param {Move} move - Ход, выбранный игроком.
     */
    submitMove(move) {
        if (this._resolveMove) {
            this._resolveMove(move);
            this._resolveMove = null;
        }
    }
}

