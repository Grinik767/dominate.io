export class Player {
    constructor(color, strategy) {
        this.color           = color;
        this.influencePoints = 0;
        this.ownedCells      = new Set();
        this.strategy        = strategy;
    }
}
