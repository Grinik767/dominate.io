import {Cell} from "./cell.js";
import {directions, DEFAULT_SIZE, BIG_SIZE} from "../globals.js";
import {Player} from "../Agents/player.js";
import {Move} from "./move.js";
import { AudioPlayer } from '../../audioManager.js';
import {generateField} from "./field.js";

export class GameLogic extends EventTarget {

    constructor(radius, dominators) {
        super();
        this.selected = null;
        this.state = generateField(radius, dominators)
    }

    get currentDominator() {
        return this.state.currentDominator;
    }

    isOver() {
        /**
         * Закончена ли игра?
         * @returns {boolean} — Количество игроков <= 1?
         */
        const activePlayers = this.state.dominators.filter(d => !d.eliminated);
        return activePlayers.length <= 1;
    }

    canCapture(from, to) {
        /**
         * Проверяет, можно ли захватить клетку to из клетки from
         * @param {number} from Клетка, которая пытается захватить
         * @param {number} to Клетка, которую пытаются захватить
         */
        const dq = to.q - from.q;
        const dr = to.r - from.r;
        if (!directions.some(d => d.q === dq && d.r === dr)) {
            return false;
        }
        return from.power > 1 && !this.state.currentDominator.ownedCells.has(`${to.q},${to.r}`);
    }

    makeMove(move) {
        switch (move.type) {
            case 'select':
                this._trySelect(move.data.q, move.data.r);
                break;
            case 'capture':
                this._tryCapture(move.data.from, move.data.to);
                break;
            case 'upgrade':
                this._tryUpgrade(move.data.q, move.data.r);
                break;
            case 'endPhase':
                this._endPhase();
                break;
        }

        if (this.selected) {
            const sel = this.state.cells.find(c => c.q === this.selected.q && c.r === this.selected.r);
            if (!sel || sel.power <= 1) {
                this.selected = null;
            }
        }
    }

    onCellClick(viewCell) {
        /**
         * Обработчик события нажатия на хекс.
         * @param {ViewCell} cell - Ячейка, на которую кликнули
         */
        // Если текущий доминтор не игрок(бот или сетевой игрок), ничего не делаем
        if (!(this.state.currentDominator.agent instanceof Player)) {
            return;
        }
        const dominator = this.state.currentDominator;
        const key = `${viewCell.q},${viewCell.r}`;
        let wrong = true;

        if (this.state.capturePhase) {
            if (dominator.ownedCells.has(key)) {
                dominator.agent.submitMove(new Move('select', {q: viewCell.q, r: viewCell.r}));
                wrong = false;
            } else if (this.selected) {
                dominator.agent.submitMove(new Move(
                    'capture',
                    {
                        from: this.selected,
                        to: {q: viewCell.q, r: viewCell.r}
                    }));
                wrong = false;
            }
        } else if (dominator.ownedCells.has(key)) {
            dominator.agent.submitMove(new Move('upgrade', {q: viewCell.q, r: viewCell.r}));
            wrong = false;
        }

        if (wrong) {
            AudioPlayer.playSound('wrong-click');
        }
        else {
            AudioPlayer.playSound('click');
        }
    }
    _trySelect(q, r) {
        /**
         * Выбрать клетку с координатами q, r, s = - q - r
         * @param {number} q Первая координата
         * @param {number} e Вторая координата
         */
        if (!this.state.capturePhase)
            return;
        const key = `${q},${r}`;
        const cell = this.state.cells.find(c => c.q === q && c.r === r);
        if (cell && cell.power > 1 && this.state.currentDominator.ownedCells.has(key)) {
            this.selected = {q, r};
        }
        AudioPlayer.playSound("click")
    }

    _tryCapture(from, to) {
        /**
         * Метод пытается захватить клетку to, находясь в клетке from.
         * @param {number} from Клетка, которая пытается захватить
         * @param {number} to Клетка, которую пытаются захватить
         */
        const ceilFrom = this.state.cells.find(c => c.q === from.q && c.r === from.r);
        const ceilTo = this.state.cells.find(c => c.q === to.q && c.r === to.r);
        if (!ceilFrom || !ceilTo) return;

        // Кажется ещё лучше добавить проверку на мощность.
        if (!this.canCapture(ceilFrom, ceilTo)) return;

        const key = `${to.q},${to.r}`;

        if (ceilTo.owner === null) {
            ceilTo.power = ceilFrom.power - 1;
            ceilFrom.power = 1;
            ceilTo.owner = this.state.currentDominator;

            this.state.currentDominator.ownedCells.add(key);
            this.selected = {q: to.q, r: to.r};
            return;
        }

        const oldIndex = ceilTo.owner.index;
        if (oldIndex !== this.state.currentDominatorIndex) {
            const chance = this._getCaptureChance(ceilFrom.power - ceilTo.power);
            if (Math.random() < chance) {
                if (!this.state.dominators[oldIndex].ownedCells.has(key))
                    throw new Error(`${this.state.dominators[oldIndex].name}[${this.state.dominators[oldIndex].index}] don't have ${key}`);
                this.state.dominators[oldIndex].ownedCells.delete(key);
                ceilTo.owner = this.state.currentDominator;
                ceilTo.power = Math.max(ceilFrom.power - ceilTo.power, 1);
                ceilFrom.power = 1;
                this.state.currentDominator.ownedCells.add(key);

                this.selected = {q: to.q, r: to.r};

                if (this.state.dominators[oldIndex].ownedCells.size === 0) {
                    this._eliminate(oldIndex);
                }
            } else {
                ceilFrom.power = 1;
                ceilTo.power = Math.max(ceilTo.power - ceilFrom.power, 1);
            }
        }
    }

    _tryUpgrade(q, r) {
        /**
         * Метод пытается улучшить клетку с координатами q, r, s = - q - r для текущего игрока
         * @param {number} q Первая координата
         * @param {number} e Вторая координата
         */
        if (this.state.capturePhase)
            return false;

        const cell = this.state.cells.find(c => c.q === q && c.r === r);
        if (!cell)
            return false;

        const key = `${q},${r}`;
        const dominator = this.state.currentDominator;
        if (dominator.ownedCells.has(key) && dominator.influencePoints > 0 && cell.power < cell.size) {
            cell.power++;
            dominator.influencePoints--;
        }
        return true;
    }

    async autoUpgrade() {
        const dominator = this.state.currentDominator;

        while (dominator.influencePoints > 0) {
            const upg = [];

            for (const key of dominator.ownedCells) {
                const [q, r] = key.split(',').map(Number);
                const c = this.state.cells.find(c => c.q === q && c.r === r);
                const maxP = c.size;
                if (c.power < maxP) upg.push(c);
            }

            if (!upg.length) break;

            const c = upg[Math.floor(Math.random() * upg.length)];

            // Submit a move
            dominator.agent.submitMove(new Move('upgrade', { q: c.q, r: c.r }));

            // TODO: РАЗОБРАТЬСЯ КАК РАБОТАЕТ.
            // Wait for main loop to process the move and come back to getMove()
            await new Promise(resolve => {
                // Hook into the agent to resume autoUpgrade after the move is processed
                const originalGetMove = dominator.agent.getMove.bind(dominator.agent);
                dominator.agent.getMove = async (state) => {
                    // Restore original getMove for next call
                    dominator.agent.getMove = originalGetMove;
                    resolve(); // Continue autoUpgrade
                    return await originalGetMove(state); // Proceed with normal behavior
                };
            });
        }
    }

    _changeCell() {

    }

    _endPhase() {
        /**
         * Выполняет логику окончания разных фаз
         */
        if (this.state.capturePhase) {
            this.state.currentDominator.influencePoints += this.state.currentDominator.ownedCells.size;
        } else {
            const total = this.state.dominators.length;
            do {
                this.state.currentDominatorIndex = (this.state.currentDominatorIndex + 1) % total;
            } while (this.state.dominators[this.state.currentDominatorIndex].eliminated);
        }

        this.state.capturePhase = !this.state.capturePhase;
        this.selected = null;
    }

    _eliminate(idx) {
        const dominator = this.state.dominators[idx];
        dominator.eliminated = true;

        this.state.cells.forEach(c => {
            if (c.owner && c.owner.index === idx) {
                c.owner = null;
            }
        });

        // Обновим currentDominatorIndex, если текущий игрок был выкинут
        if (this.state.currentDominatorIndex === idx) {
            this._endPhase(); // Сразу передаём ход дальше
        }

        AudioPlayer.playSound('player-defeated')
    }

    _getCaptureChance(d) {
        /**
         * Возвращает вероятность захвата занятого хекса в зависимости от разности мощностей клеток
         * @param {number} d Разность мощностей клеток
         * @returns {number} — Вероятность захватить клетку
         */
        if (d <= -2) return 0;
        else if (d === -1) return 0.25;
        else if (d === 0) return 0.5;
        else if (d === 1) return 0.75;
        return 1;
    }
}
