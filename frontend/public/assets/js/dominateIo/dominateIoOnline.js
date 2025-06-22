import {NetGameLogic} from './Game/netGameLogic.js';

import {FieldRenderer} from './View/fieldRenderer.js';
import {UI} from "./View/ui.js";
import {GameState} from "./Game/gameState.js";
import {Cell} from "./Game/cell.js";
import {BIG_SIZE, DEFAULT_SIZE} from "./globals.js";

const thisPlayerName = localStorage.getItem('playerName');
const playersInfo = JSON.parse(localStorage.getItem("players"));
const gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
const state = GameState.fromCells(
    gameInfo.field.map(cell => {
        const newCell = new Cell(cell.q, cell.r, cell.s, cell.size ? BIG_SIZE : DEFAULT_SIZE)
        newCell.owner = cell.owner;
        return newCell;
    }),
    gameInfo.playersQueue,
    thisPlayerName,
    playersInfo);

const netGameLogic = new NetGameLogic(code, state);
const borderRenderer = new FieldRenderer(netGameLogic.state, netGameLogic.onCellClick.bind(netGameLogic));
const ui = new UI(netGameLogic);

(async function mainLoop() {
    while (!netGameLogic.isOver()) {
        const move = await netGameLogic.currentDominator.agent.getMove(netGameLogic.state);
        netGameLogic.makeMove(move);
        borderRenderer.update(netGameLogic.state, netGameLogic.selected);
        ui.update(netGameLogic);
    }

    netGameLogic.dispatchEvent(new CustomEvent('gameOver', {
        detail: {winner: this.state.dominators.filter(d => !d.eliminated)[0]}
    }));
})();
