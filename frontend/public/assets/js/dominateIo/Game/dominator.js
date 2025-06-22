/**
 * Представляет игрока(локальный игрок, сетевой игрок, бот) в игре
 *
 * @class
 */
export class Dominator {

    /**
     * @param {string} color - Цвет доминтора.
     * @param {string} name - Цвет игрока.
     * @param {BasicBot} agent - Агент, который представляет действия игрока
     */
    constructor(color, name, agent, index) {
        this.color = color;
        this.name = name;
        this.influencePoints = 0;
        this.ownedCells = new Set();
        this.agent = agent;
        this.index = index;
    }
}
