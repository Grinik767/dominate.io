export class HumanStrategy {
    constructor() {
        this._resolve = null;
    }
    getMove() {
        return new Promise(resolve => {
            this._resolve = resolve;
        });
    }
    submitMove(move) {
        if (this._resolve) {
            this._resolve(move);
            this._resolve = null;
        }
    }
}
