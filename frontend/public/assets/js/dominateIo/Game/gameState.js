import {Player} from "../Agents/player.js";
import {NetPlayer} from "../Agents/netPlayer.js";
import {Dominator} from "./dominator.js";

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

    static fromCells(netClient, cells, playersQueue, thisPlayerName, playersInfo) {
        const dominators = [];
        let i = 0;
        for (const player of playersQueue) {
            const playerInfo = playersInfo[player.name];
            dominators.push(new Dominator(playerInfo.color,
                                          player.name,
                                    player.name === thisPlayerName ? new Player() : new NetPlayer(),
                                          i));
            i++;
        }

        cells.forEach(cell => {
            cell.owner = dominators[playersQueue.find(cell.owner)]
        });

        return new GameState(cells, dominators);
    }
}