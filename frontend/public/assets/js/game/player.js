/**
 * Представляет игрока в игре
 *
 * @class
 */
export class Player {

    /**
     * @param {string} color - Цвет игрока.
     * @param {Function} strategy - Стратегия игрока.
     */
    constructor(color, strategy) {
        this.color           = color;
        this.influencePoints = 0;
        this.ownedCells      = new Set();
        this.strategy        = strategy;
    }
}
