import {GameLogic} from './Game/gameLogic.js';
import {Dominator} from './Game/dominator.js';
import {getRandomColors} from './globals.js';

import {Player} from './Agents/player.js';
import {NetPlayer} from './Agents/netPlayer.js';

import {FieldRenderer} from './View/fieldRenderer.js';
import {UI} from "./View/ui.js";

const params = new URLSearchParams(window.location.search);
const lobbyCode = params.get('code');
const playersCount = parseInt(params.get('playersCount'));

const colors = getRandomColors(players + bots);

let dominators = []
for (let i = 0; i < players; i++) {
    dominators.push(new Dominator(colors[i], `Player ${i}`, new Player(), i));
}

for (let i = 0; i < bots; i++) {
    let agent = new BasicBot();
    let name = 'Bot'
    if (level === 2) {
        agent = new AggressiveBot();
        name = 'Aggressive Bot'
    }
    dominators.push(new Dominator(colors[i + players], `${name} ${i}`, agent, i + players));
}

const gameLogic = new GameLogic(fieldSize, dominators);
const borderRenderer = new FieldRenderer(gameLogic.state, gameLogic.onCellClick.bind(gameLogic));
const ui = new UI(gameLogic);

(async function mainLoop() {
    while (!gameLogic.isOver()) {
        const move = await gameLogic.currentDominator.agent.getMove(gameLogic.state);
        gameLogic.makeMove(move);
        borderRenderer.update(gameLogic.state, gameLogic.selected);
        ui.update(gameLogic);
    }

    gameLogic.dispatchEvent(new CustomEvent('gameOver', {
        detail: {winner: gameLogic.state.dominators[0]}
    }));
})();
