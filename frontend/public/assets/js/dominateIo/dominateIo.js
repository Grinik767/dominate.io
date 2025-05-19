import {GameLogic} from './gameLogic.js';
import {Dominator} from './dominator.js';

import {Player} from './Agents/player.js';

import {Button, Display, GameBoard} from './ui.js';
import {BoardRenderer} from './boardRenderer.js';

const board = new GameBoard('dominateIo-container');
const phaseBtn = new Button('phase-button');
const autoBtn = new Button('auto-upgrade');
const pointsLabel = new Display('points');
const currentPlayerLabel = new Display('player-color-name');


const dominators = [
    // TODO: написать метод получения цвета
    new Dominator('blue', 'Player1', new Player()),
    new Dominator('red', 'Player2', new Player()),
    new Dominator('green','Player3', new Player())
];

const gameLogic = new GameLogic(5, dominators);
const renderer = new BoardRenderer(gameLogic, board);

autoBtn.hide();

phaseBtn.onClick(() =>
    gameLogic.currentDominator.strategy.submitMove({type: 'endPhase'})
);

autoBtn.onClick(() =>
    gameLogic.makeMove({type: 'autoUpgrade'})
);

gameLogic.addEventListener('stateChanged', ev => {
    const state = ev.detail;

    if (state.capturePhase) {
        phaseBtn.setText('Перейти к фазе прокачки');
        autoBtn.hide();
    } else {
        phaseBtn.setText('Передать ход');
        autoBtn.show();
    }

    currentPlayerLabel.setText(state.currentDominator.name);
    currentPlayerLabel.setColor(state.currentDominator.color);
    pointsLabel.setText(state.currentDominator.influencePoints);
});

// dominateIo.addEventListener('playerEliminated', ev => {
//     strategies.splice(ev.detail.index, 1);
// });

gameLogic.addEventListener('gameOver', ev => {
    alert(`Победил игрок: ${ev.detail.winner.toUpperCase()}!`);
});

gameLogic._emitState();

export function onCellClick(cell) {
    /**
     * Обработчик события нажатия на хекс.
     * @param {HexCell} cell - Ячейка, на которую кликнули
     */
    let state = gameLogic.getState();

    const dominator = state.dominators[state.currentDominator];
    // Если текущий доминтор не игрок(бот или сетевой игрок), ничего не делаем
    if (!dominator instanceof Player) {
        return;
    }

    const key = `${cell.q},${cell.r}`;

    if (state.capturePhase) {
        if (dominator.ownedCells.has(key)) {
            dominator.agent.submitMove({type: 'select', q: cell.q, r: cell.r});
        } else if (state.selected) {
            dominator.agent.submitMove({
                type: 'capture',
                from: {...state.selected},
                to: {q: cell.q, r: cell.r}
            });
        }
    } else if (dominator.ownedCells.has(key)) {
        dominator.agent.submitMove({type: 'upgrade', q: cell.q, r: cell.r});
    }
}

(async function mainLoop() {
    while (!gameLogic.isOver()) {
        const dominator = dominators[gameLogic.currentDominator];
        const move = await dominator.agent.getMove();
        gameLogic.makeMove(move);
    }
})();