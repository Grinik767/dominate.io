import { HexCell } from './hexCell.js';
import { onCellClick } from './gameLogic';

const hexWidth  = 50;
const hexHeight = 58;
const hGap       = 2;
const vGap       = 2;
const hSpacing   = hexWidth  + hGap;
const vSpacing   = hexHeight - hexHeight / 4 + vGap;

const dirs = [
    { q:+1, r:-1 }, { q:+1, r:0 }, { q:0, r:+1 },
    { q:-1, r:+1}, { q:-1, r:0 }, { q:0, r:-1 }
];

export class BoardRenderer {
    constructor(game, boardEl) {
        this.game       = game;
        this.board      = boardEl;
        this.hexMap     = new Map();
        this.inited     = false;

        game.addEventListener('stateChanged', ev => this._render(ev.detail));
    }

    _render(state) {
        // TODO: Может стоит просто убрать этот метод? Создавать поле сразу?
        if (!this.inited) {
            this._buildGrid(state);
            this.inited = true;
        }
        this._update(state);
    }

    _buildGrid(state) {
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

        const palette = state.players.map(p => ({ color: p.color }));

        state.cells.forEach(cdata => {
            const cell = new HexCell(cdata, palette, hSpacing, vSpacing, cx, cy);
            cell.setClickHandler(hc => onCellClick(hc));
            this.board.append(cell.wrapper);
            this.hexMap.set(`${cdata.q},${cdata.r}`, cell);
        });
    }

    _update(state) {
        state.cells.forEach(cdata => {
            const key  = `${cdata.q},${cdata.r}`;
            const cell = this.hexMap.get(key);

            cell.setPower(cdata.power);
            cell.setOwner(cdata.ownerIndex);

            if (cdata.ownerIndex != null) {
                cell.el.style.background = state.players[cdata.ownerIndex].color;
            } else {
                cell.el.style.background = '#111';
            }
        });

        this.hexMap.forEach(c => {
            c.deselect();
            c.clearHighlight();
        });

        if (state.capturePhase && state.selected) {
            window.requestAnimationFrame(() => {
                const selKey = `${state.selected.q},${state.selected.r}`;
                const selCell = this.hexMap.get(selKey);
                if (selCell) selCell.select();

                dirs.forEach(d => {
                    const nk = `${state.selected.q + d.q},${state.selected.r + d.r}`;
                    const nb = this.hexMap.get(nk);
                    if (nb && !state.players[state.currentPlayer].ownedCells.has(nk)) {
                        nb.highlight();
                    }
                });
            });
        }
    }
}
