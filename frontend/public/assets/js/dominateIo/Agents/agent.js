/**
 * Абстрактный класс, представляющий агента игрока
 */
export class Agent {
    /**
     * Метод, который должен быть реализован наследниками.
     * Должен вернуть Promise с объектом хода.
     *
     * @returns {Promise<Move>}
     */
    async getMove(gameState) {
        throw new Error("getMove() must be implemented by subclass");
    }
}
