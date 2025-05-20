import {ViewCell} from './viewCell.js';
import {GameBoard} from "./components.js";
import {directions} from "../globals.js";

const hexWidth = 50;
const hexHeight = 58;
const hGap = 2;
const vGap = 2;
const hSpacing = hexWidth + hGap;
const vSpacing = hexHeight - hexHeight / 4 + vGap;

export class FieldRenderer {
    constructor(gameState, onCellClick) {
        this.board = new GameBoard('dominateIo-container');
        this.hexMap = new Map();
        this._buildGrid(gameState, onCellClick);
        this.update(gameState);
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
        // TODO: Я временно добаил отсуп, чтобы по центру borad был. Надо будет потом поправить
        const cx = totalW / 2, cy = totalH / 2 - 40;

        this.board.setSize(totalW, totalH);

        state.cells.forEach(cell => {
            const viewCell = new ViewCell(cell, hSpacing, vSpacing, cx, cy, onCellClick);
            this.board.append(viewCell.wrapper);
            this.hexMap.set(`${cell.q},${cell.r}`, viewCell);
        });
    }

    update(state, selected) {
        this.hexMap.forEach(c => {
            c.deselect();
            c.clearHighlight();
            c.updateVisual();
        });

        if (state.capturePhase && selected) {
            window.requestAnimationFrame(() => {
                const selKey = `${selected.q},${selected.r}`;
                const selCell = this.hexMap.get(selKey);
                if (selCell) {
                    selCell.select();
                }

                directions.forEach(d => {
                    const neighbourKey = `${selected.q + d.q},${selected.r + d.r}`;
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
