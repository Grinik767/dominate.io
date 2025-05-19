export class GameState {
    constructor(cells, dominators) {
        this.cells = cells;
        this.dominators = dominators;
        this.currentDominatorIndex = 0;
        this.capturePhase = true;
    }

    get currentDominator() {
        return this.dominators[this.currentDominatorIndex];
    }
}