import {NetPlayer} from "../Agents/netPlayer.js";
import {NetOpponent} from "../Agents/netOponent.js";

export class GameState {
    constructor(cells, dominators) {
        this.cells = cells;
        this.dominators = dominators;
        this.currentDominatorIndex = 0;
        this.capturePhase = true;
    }

    get currentDominator() {
        return this.dominators[this.currentDominatorIndex];
    }

    toCells() {
        const newCells = [];
        for (const cell of this.cells) {
            if (cell.owner){
                console.log(cell)
                cell.owner = cell.owner.name;
            }
            newCells.push(cell);
        }

        return newCells;
    }

    static fromCells(netClient, cells, playersQueue, thisPlayerName) {
        const dominators = [];
        for (const player of playersQueue) {
            if (player.name === thisPlayerName) {
                dominators.push(new NetPlayer(player.name, netClient))
            }
            else {
                dominators.push(new NetOpponent(player.name, netClient));
            }
        }

        cells.forEach(cell => {
            cell.owner = dominators[playersQueue.find(cell.owner)]
        });

        return new GameState(cells, dominators);
    }
}