import {GameLogic} from './Game/gameLogic.js';
import {Dominator} from './Game/dominator.js';

import {Player} from './Agents/player.js';
import {BasicBot, AggressiveBot} from './Agents/bots.js';


import {BoardRenderer} from './View/boardRenderer.js';
import {UI} from "./View/ui.js";


const dominators = [
    // TODO: написать метод получения цвета
    new Dominator('blue', 'Player1', new Player(), 0),
    // new Dominator('red', 'Bot', new BasicBot(), 1),
    new Dominator('purple', 'AggressiveBot', new AggressiveBot(), 1),
];

const gameLogic = new GameLogic(5, dominators);
const borderRenderer = new BoardRenderer(gameLogic.state, gameLogic.onCellClick.bind(gameLogic));
const ui = new UI(gameLogic);

(async function mainLoop() {
    while (!gameLogic.isOver()) {
        const move = await gameLogic.currentDominator.agent.getMove(gameLogic.state);
        gameLogic.makeMove(move);
        borderRenderer.update(gameLogic.state, gameLogic.selected);
        ui.update(gameLogic);
    }
})();