import {Player} from "../Agents/player.js";
import {NetPlayer} from "../Agents/netPlayer.js";
import {Dominator} from "./dominator.js";
import {BIG_SIZE} from "../globals.js";

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
            if (cell.owner && cell.owner !== -1){
                cell.owner = cell.owner.index;
                console.log(cell.owner)
            }
            else {
                cell.owner = -1;
            }
            cell.size = cell.size === BIG_SIZE;
            newCells.push(cell);
        }

        return newCells;
    }

    static fromCells(cells, playersQueue, thisPlayerName, playersInfo) {
        const dominators = [];
        let i = 0;
        for (const player of playersQueue) {
            const playerInfo = playersInfo[player];
            dominators.push(new Dominator(playerInfo.Color,
                                          player,
                                    player === thisPlayerName ? new Player() : new NetPlayer(),
                                          i));
            i++;
        }

        cells.forEach(cell => {
            if (cell.owner.length === 0){
                cell.owner = null;
                return;
            }

            dominators.forEach(dominator => {
                if (dominator.name === cell.owner){
                    cell.owner = dominator;
                    cell.owner.ownedCells.add(cell.key)
                }
            })
        });

        console.log(cells);
        return new GameState(cells, dominators);
    }
}