/**
 * Представляет игрока(локальный игрок, сетевой игрок, бот) в игре
 *
 * @class
 */
export class Dominator {

    // TODO: поправить комментарии
    /**
     * @param {string} color - Цвет доминтора.
     * @param {string} name - Цвет игрока.
     * @param {Agent} agent - Агент, который представляет действия игрока
     */
    constructor(color, name, agent) {
        this.color = color;
        this.name = name;
        this.influencePoints = 0;
        this.ownedCells = new Set();
        this.agent = agent;
    }
}
