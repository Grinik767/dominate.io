import {ViewCell} from './viewCell.js';
import {GameBoard} from "./components";
import {directions} from "../globals.js";

const hexWidth = 50;
const hexHeight = 58;
const hGap = 2;
const vGap = 2;
const hSpacing = hexWidth + hGap;
const vSpacing = hexHeight - hexHeight / 4 + vGap;

export class BoardRenderer {
    constructor(gameState, onCellClick) {
        this.board = new GameBoard('dominateIo-container');
        this.hexMap = new Map();
        this._buildGrid(gameState, onCellClick);
    }

    _buildGrid(state, onCellClick) {
        /**
         * Метод построения сетки по переданному состоянию
         * @param {Object} state - Состояние игры, которое нужно отобразить
         */
        const qs = state.cells.map(c => c.q);
        const rs = state.cells.map(c => c.r);
        const qMin = Math.min(...qs), qMax = Math.max(...qs);
        const rMin = Math.min(...rs), rMax = Math.max(...rs);

        const totalW = (qMax - qMin + 1) * hSpacing + hexWidth;
        const totalH = (rMax - rMin + 1) * vSpacing + hexHeight;
        const cx = totalW / 2, cy = totalH / 2;

        this.board.setSize(totalW, totalH);

        state.cells.forEach(cell => {
            const viewCell = new ViewCell(cell, hSpacing, vSpacing, cx, cy, onCellClick);
            this.board.append(viewCell.wrapper);
            this.hexMap.set(`${cell.q},${cell.r}`, viewCell);
        });
    }

    update(state) {
        this.hexMap.forEach(c => {
            c.deselect();
            c.clearHighlight();
            c.updateVisual();
        });

        if (state.capturePhase && state.selected) {
            window.requestAnimationFrame(() => {
                const selKey = `${state.selected.q},${state.selected.r}`;
                const selCell = this.hexMap.get(selKey);
                if (selCell) {
                    selCell.select();
                }

                directions.forEach(d => {
                    const neighbourKey = `${state.selected.q + d.q},${state.selected.r + d.r}`;
                    const neighbourViewCell = this.hexMap.get(neighbourKey);
                    const currentDominator = state.dominators[state.currentDominatorIndex];
                    if (neighbourViewCell && !currentDominator.ownedCells.has(neighbourKey)) {
                        neighbourViewCell.highlight();
                    }
                });
            });
        }
    }
}
