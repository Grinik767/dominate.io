import {Player} from "./player.js";

export class NetPlayer extends Player {
    constructor(name, netClient) {
        super();
        this._resolve = null;
        this.netClient = netClient;
    }

    submitMove(move) {
        if (this._resolveMove) {
            this._resolveMove(move);
            this._resolveMove = null;
            this.netClient.submitMove(move);
        }
    }
}

