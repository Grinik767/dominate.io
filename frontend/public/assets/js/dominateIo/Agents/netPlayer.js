import {Agent} from "./agent.js";

/**
 * Represents a human player agent who makes moves via the UI.
 */
export class NetPlayer extends Agent {
    constructor() {
        super();
        this._resolve = null;
    }

    /**
     * Called by the dominateIo loop. Returns a promise that resolves when the player makes a move.
     * @returns {Promise<Object>} The move selected by the player.
     */
    async getMove(state) {
        return new Promise((resolve) => {
            this._resolveMove = resolve;
        });
    }

    /**
     * Called by the UI when the player selects a move.
     * @param {Move} move - The move chosen by the player.
     */
    submitMove(move) {
        console.log(move, 'in submitMove');
        if (this._resolveMove) {
            this._resolveMove(move);
            this._resolveMove = null;
        }
    }
}

