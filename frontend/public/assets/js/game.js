import { Game }            from './gameEngine.js';
import { Player }          from './player.js';
import { HumanStrategy }   from './strategies/human.js';
import { Button, Display, GameBoard } from './ui.js';
import { Renderer }        from './renderer.js';

const board              = new GameBoard('game-container');
const phaseBtn           = new Button('phase-button');
const autoBtn            = new Button('auto-upgrade');
const pointsLabel        = new Display('points');
const currentPlayerLabel = new Display('player-color-name');

const strategies = [
    new HumanStrategy(),
    new HumanStrategy(),
    new HumanStrategy()
];

const players = [
    new Player('blue',  strategies[0]),
    new Player('red',   strategies[1]),
    new Player('green', strategies[2])
];

const game     = new Game(5, players);
const renderer = new Renderer(game, board, strategies);

autoBtn.hide();

phaseBtn.onClick(() =>
    strategies[game.currentPlayer].submitMove({ type:'endPhase' })
);
autoBtn.onClick(() =>
    game.makeMove({ type:'autoUpgrade' })
);

game.addEventListener('stateChanged', ev => {
    const st = ev.detail;
    const cp = st.players[st.currentPlayer];
    const names = { blue:'СИНИЙ', red:'КРАСНЫЙ', green:'ЗЕЛЁНЫЙ' };

    if (st.capturePhase) {
        phaseBtn.setText('Перейти к фазе прокачки');
        autoBtn.hide();
    } else {
        phaseBtn.setText('Передать ход');
        autoBtn.show();
    }

    currentPlayerLabel.setText(names[cp.color] || cp.color.toUpperCase());
    currentPlayerLabel.setColor(cp.color);
    pointsLabel.setText(cp.influencePoints);
});

game.addEventListener('playerEliminated', ev => {
    strategies.splice(ev.detail.index, 1);
});

game.addEventListener('gameOver', ev => {
    alert(`Победил игрок: ${ev.detail.winner.toUpperCase()}!`);
});

game._emitState();

(async function mainLoop() {
    while (!game.isOver()) {
        const i    = game.currentPlayer;
        const move = await strategies[i].getMove(game.getState());
        game.makeMove(move);
    }
})();
