import {GameLogic} from './Game/gameLogic.js';
import {Dominator} from './Game/dominator.js';
import {getRandomColors} from './globals.js';

import {Player} from './Agents/player.js';
import {BasicBot, AggressiveBot} from './Agents/bots.js';


import {FieldRenderer} from './View/fieldRenderer.js';
import {UI} from "./View/ui.js";

const params = new URLSearchParams(window.location.search);
const players = parseInt(params.get('players'), 10);
const bots = parseInt(params.get('bots'), 10);
const level = parseInt(params.get('level'), 10);
const fieldSize = parseInt(params.get('size'), 10);

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

// TODO: Пофиксить шафл. Там проблема с переходм к след игроку
// dominators = [...dominators].sort(() => 0.5 - Math.random());

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

