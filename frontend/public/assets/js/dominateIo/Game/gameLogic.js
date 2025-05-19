import {GameState} from "./gameState.js";
import {Cell} from "./cell.js";
import {directions, DEFAULT_SIZE, BIG_SIZE} from "../globals.js";
import {Player} from "../Agents/player";

export class GameLogic extends EventTarget {
    constructor(radius, dominators) {
        super();
        this.radius = radius;
        this.selected = null;
        let cells = this._generateField();
        this.state = new GameState(cells, dominators);
        this._placeStartingCells();
    }

    get currentDominator() {
        return this.state.currentDominator;
    }

    isOver() {
        /**
         * Закончена ли игра?
         * @returns {boolean} — Количество игроков <= 1?
         */
        return this.state.dominators.length <= 1;
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
        return from.power > 1 && !this.currentDominator.ownedCells.has(`${to.q},${to.r}`);
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

        // TODO: ??? Что это вообще здесь делает ???
        if (this.selected) {
            const sel = this.cells.find(c => c.q === this.selected.q && c.r === this.selected.r);
            if (!sel || sel.power <= 1) this.selected = null;
        }

        if (this.isOver()) {
            this.dispatchEvent(new CustomEvent('gameOver', {
                detail: {winner: this.dominators[0]}
            }));
        }
    }

    onCellClick(viewCell) {
        /**
         * Обработчик события нажатия на хекс.
         * @param {ViewCell} cell - Ячейка, на которую кликнули
         */
        // Если текущий доминтор не игрок(бот или сетевой игрок), ничего не делаем
        if (!this.state.currentDominator instanceof Player) {
            return;
        }
        const dominator = this.state.currentDominator;
        const key = `${viewCell.q},${viewCell.r}`;

        if (this.state.capturePhase) {
            if (dominator.ownedCells.has(key)) {
                dominator.agent.submitMove({type: 'select', q: viewCell.q, r: viewCell.r});
            } else if (this.selected) {
                dominator.agent.submitMove({
                    type: 'capture',
                    from: {...this.selected},
                    to: {q: viewCell.q, r: viewCell.r}
                });
            }
        } else if (dominator.ownedCells.has(key)) {
            dominator.agent.submitMove({type: 'upgrade', q: viewCell.q, r: viewCell.r});
        }
    }

    _generateField() {
        /**
         * Метод генерации поля
         */
        const out = [];
        for (let q = -this.radius; q <= this.radius; q++) {
            for (let r = Math.max(-this.radius, -q - this.radius);
                 r <= Math.min(this.radius, -q + this.radius);
                 r++
            ) {
                if (Math.random() < 0.2)
                    continue;
                out.push(new Cell(q, r, -q - r, Math.random() < 0.2 ? BIG_SIZE : DEFAULT_SIZE));
            }
        }
        return out;
    }

    _placeStartingCells() {
        /**
         * Метод расположения начальных позиций игроков
         */
        this.dominators.forEach((dominator, idx) => {
            let cell;
            do {
                cell = this.cells[Math.floor(Math.random() * this.cells.length)];
            } while (cell.ownerIndex != null);
            cell.ownerIndex = idx;
            cell.power = 2;
            dominator.ownedCells.add(`${cell.q},${cell.r}`);
        });
    }

    _trySelect(q, r) {
        /**
         * Выбрать клетку с координатами q, r, s = - q - r
         * @param {number} q Первая координата
         * @param {number} e Вторая координата
         */
        if (!this.capturePhase)
            return;
        const key = `${q},${r}`;
        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (cell && cell.power > 1 && this.currentDominator.ownedCells.has(key)) {
            this.selected = {q, r};
        }
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
        const old = ceilTo.ownerIndex;

        if (old == null) {
            ceilTo.power = ceilFrom.power - 1;
            ceilFrom.power = 1;
            ceilTo.ownerIndex = this.state.currentDominatorIndex;

            this.currentDominator.ownedCells.add(key);
            this.selected = {q: to.q, r: to.r};
            return;
        }

        if (old !== this.currentDominatorIndex) {
            const chance = this._getCaptureChance(ceilFrom.power - ceilTo.power);
            if (Math.random() < chance) {
                this.state.dominators[old].ownedCells.delete(key);
                ceilTo.ownerIndex = this.state.currentDominatorIndex;
                ceilTo.power = Math.max(ceilFrom.power - ceilTo.power, 1);
                ceilFrom.power = 1;
                this.currentDominator.ownedCells.add(key);

                this.selected = {q: to.q, r: to.r};

                if (this.dominators[old].ownedCells.size === 0) {
                    this._eliminate(old);
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
        if (this.capturePhase)
            return;

        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (!cell)
            return;

        const key = `${q},${r}`;
        const dominator = this.currentDominator;
        if (dominator.ownedCells.has(key) && dominator.influencePoints > 0 && cell.power < cell.size) {
            cell.power++;
            dominator.influencePoints--;
        }
    }

    autoUpgrade() {
        /**
         * Случайно распределяет очки influencePoints для текущего игрока
         */
        const pl = this.currentDominator;
        while (pl.influencePoints > 0) {
            const upg = [];
            // TODO: Почему upg каждый раз пересчитывается?
            // TODO: добавить просто вызов метода update
            for (const key of pl.ownedCells) {
                const [q, r] = key.split(',').map(Number);
                const c = this.cells.find(c => c.q === q && c.r === r);
                // TODO: Поменять на int
                const maxP = c.size === 'big' ? 12 : 8;
                if (c.power < maxP) upg.push(c);
            }
            if (!upg.length) break;
            const c = upg[Math.floor(Math.random() * upg.length)];
            c.power++;
            pl.influencePoints--;
        }
    }

    _endPhase() {
        /**
         * Выполняет логику окончания разных фаз
         */
        if (this.capturePhase) {
            this.currentDominator.influencePoints += this.currentDominator.ownedCells.size;
        } else {
            this.currentDominatorIndex = (this.currentDominatorIndex + 1) % this.dominators.length;
        }
        this.capturePhase = !this.capturePhase;
        this.selected = null;
    }

    _eliminate(idx) {
        /**
         * Убрать игрока с индексом idx из игры
         * @param {number} idx Индекс игрока, который выбывает из игры
         */
        // TODO: Лучше не удалять игрока, а просто когда будет переход на другого игрока делаться, то проверять, что
        // у игрока есть клетки. Иначе скипать.
        this.dominators.splice(idx, 1);
        this.cells.forEach(c => {
            if (c.ownerIndex === idx) c.ownerIndex = null;
            else if (c.ownerIndex > idx) c.ownerIndex--;
        });
        this.dispatchEvent(new CustomEvent('playerEliminated', {
            detail: {index: idx}
        }));
        // После того как обновили индексы, нужно поправить currentPlayer
        if (this.currentDominator >= idx) {
            this.currentDominatorIndex = Math.max(0, this.currentDominator - 1);
        }
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
