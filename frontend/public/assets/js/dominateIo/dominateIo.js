import {GameLogic} from './Game/gameLogic.js';
import {Dominator} from './Game/dominator.js';

import {Player} from './Agents/player.js';
import {Bot} from './Agents/bot.js';


import {BoardRenderer} from './View/boardRenderer.js';
import {UI} from "./View/ui";


const dominators = [
    // TODO: написать метод получения цвета
    new Dominator('blue', 'Player1', new Player()),
    new Dominator('red', 'Bot', new Bot()),
];

const gameLogic = new GameLogic(5, dominators);
new BoardRenderer(gameLogic.state);
new UI(gameLogic);

gameLogic.addEventListener('stateChanged', ev => {
    const state = ev.detail;

    if (state.capturePhase) {
        phaseBtn.setText('Перейти к фазе прокачки');
        autoBtn.hide();
    } else {
        phaseBtn.setText('Передать ход');
        autoBtn.show();
    }

    let currentDominator = state.dominators[state.currentDominatorIndex];

    currentPlayerLabel.setText(currentDominator.name);
    currentPlayerLabel.setColor(currentDominator.color);
    pointsLabel.setText(currentDominator.influencePoints);
});


(async function mainLoop() {
    while (!gameLogic.isOver()) {
        const move = await gameLogic.currentDominator.agent.getMove(gameLogic.getState());
        gameLogic.makeMove(move);
    }
})();