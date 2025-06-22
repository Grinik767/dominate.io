import { Player } from "./player.js";

/**
 * A player that can queue multiple moves and keeps track of move history.
 */
export class NetPlayer extends Player {
    constructor() {
        super();
        this._moveQueue = [];
        this._moveHistory = [];
        this._waitingResolver = null;
    }

    /**
     * Overrides the base getMove to support queuing.
     * @returns {Promise<Object>} The next move from the queue or waits for one.
     */
    async getMove(state) {
        if (this._moveQueue.length > 0) {
            const move = this._moveQueue.shift();
            this._moveHistory.push(move);
            return move;
        }

        return new Promise((resolve) => {
            this._waitingResolver = resolve;
        });
    }

    /**
     * Submit a move. If getMove is waiting, resolve it immediately.
     * Otherwise, enqueue the move.
     * @param {Move} move
     */
    submitMove(move) {
        if (this._waitingResolver) {
            this._moveHistory.push(move);
            this._waitingResolver(move);
            this._waitingResolver = null;
        } else {
            this._moveQueue.push(move);
        }
    }

    /**
     * Returns the list of all submitted moves so far.
     * @returns {Move[]}
     */
    getMoveHistory() {
        return [...this._moveHistory];
    }

    /**
     * Clear the history and queue
     */
    reset() {
        this._moveQueue = [];
        this._moveHistory = [];
        this._waitingResolver = null;
    }
}
