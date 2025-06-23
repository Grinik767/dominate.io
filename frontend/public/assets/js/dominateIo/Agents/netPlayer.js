import {Agent} from "./agent.js";

/**
 * Представляет агент-человека, который делает ходы через пользовательский интерфейс.
 */
export class NetPlayer extends Agent {
    constructor() {
        super();
        this._resolve = null;
    }

    /**
     * Вызывается циклом dominateIo. Возвращает промис, который разрешается, когда игрок делает ход.
     * @returns {Promise<Object>} Ход, выбранный игроком.
     */
    async getMove(state) {
        return new Promise((resolve) => {
            this._resolveMove = resolve;
        });
    }

    /**
     * Вызывается пользовательским интерфейсом, когда игрок выбирает ход.
     * @param {Move} move - Ход, выбранный игроком.
     */
    submitMove(move) {
        if (this._resolveMove) {
            this._resolveMove(move);
            this._resolveMove = null;
        }
    }
}

