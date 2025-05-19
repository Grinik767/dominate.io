export class GameLogic extends EventTarget {
    constructor(radius, dominators) {
        super();
        this.radius = radius;
        this.dominators = dominators;
        this.currentDominatorIndex = 0;
        this.capturePhase = true;
        this.selected = null;
        this.cells = this._generateField();
        this._placeStartingCells();
    }

    get currentDominator() {
        return this.dominators[this.currentDominatorIndex];
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
                if (Math.random() < 0.2) continue;
                out.push({
                    q,
                    r,
                    s: -q - r,
                    power: 0,
                    ownerIndex: null,
                    size: Math.random() < 0.2 ? 'big' : 'small'
                });
            }
        }
        return out;
    }

    _placeStartingCells() {
        /**
         * Метод расположения начальных позиций игроков
         */
        this.dominators.forEach((pl, idx) => {
            let cell;
            do {
                cell = this.cells[Math.floor(Math.random() * this.cells.length)];
            } while (cell.ownerIndex != null);
            cell.ownerIndex = idx;
            cell.power = 2;
            pl.ownedCells.add(`${cell.q},${cell.r}`);
        });
    }

    getState() {
        /**
         * Возвращает копию состояния игры
         *
         * @returns {Object} Текущее состояние игры.
         * @returns {Array<Object>} return.cells - Массив клеток.
         * @returns {Array<Object>} return.players - Массив игроков.
         * @returns {number} return.currentPlayer - Индекс текущего игрока.
         * @returns {boolean} return.capturePhase - Находится ли игра в состоянии захвата клеток.
         * @returns {Object|null} return.selected - Выбранная клетка.
         */
        return {
            cells: this.cells.map(c => ({...c})),
            dominators: this.dominators.map(p => ({
                color: p.color,
                influencePoints: p.influencePoints,
                ownedCells: new Set(p.ownedCells),
                agent: p.agent,
                name: p.name,
            })),
            currentDominatorIndex: this.currentDominatorIndex,
            capturePhase: this.capturePhase,
            selected: this.selected ? {...this.selected} : null
        };
    }

    isOver() {
        /**
         * Закончена ли игра?
         * @returns {boolean} — Количество игроков <= 1?
         */
        return this.dominators.length <= 1;
    }

    canCapture(from, to) {
        /**
         * Проверяет, можно ли захватить клетку to из клетки from
         * @param {number} from Клетка, которая пытается захватить
         * @param {number} to Клетка, которую пытаются захватить
         */
        const dirs = [
            {q: +1, r: -1}, {q: +1, r: 0}, {q: 0, r: +1},
            {q: -1, r: +1}, {q: -1, r: 0}, {q: 0, r: -1}
        ];
        const dq = to.q - from.q, dr = to.r - from.r;
        if (!dirs.some(d => d.q === dq && d.r === dr)) return false;
        const pl = this.currentDominator;
        return from.power > 1 && !pl.ownedCells.has(`${to.q},${to.r}`);
    }

    makeMove(move) {
        switch (move.type) {
            case 'select':
                this._trySelect(move.q, move.r);
                break;
            case 'capture':
                this._tryCapture(move.from, move.to);
                break;
            case 'upgrade':
                this._tryUpgrade(move.q, move.r);
                break;
            case 'autoUpgrade':
                this._autoUpgrade();
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

        this._emitState();

        if (this.isOver()) {
            this.dispatchEvent(new CustomEvent('gameOver', {
                detail: {winner: this.dominators[0].color}
            }));
        }
    }

    _trySelect(q, r) {
        /**
         * Выбрать клетку с координатами q, r, s = - q - r
         * @param {number} q Первая координата
         * @param {number} e Вторая координата
         */
        if (!this.capturePhase) return;
        const key = `${q},${r}`;
        const pl = this.currentDominator;
        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (cell && cell.power > 1 && pl.ownedCells.has(key)) {
            this.selected = {q, r};
        }
    }

    _tryCapture(from, to) {
        /**
         * Метод пытается захватить клетку to, находясь в клетке from.
         * @param {number} from Клетка, которая пытается захватить
         * @param {number} to Клетка, которую пытаются захватить
         */
        const cf = this.cells.find(c => c.q === from.q && c.r === from.r);
        const ct = this.cells.find(c => c.q === to.q && c.r === to.r);
        if (!cf || !ct) return;

        // Кажется ещё лучше добавить проверку на мощность.
        if (!this.canCapture(cf, ct)) return;

        const pl = this.currentDominator;
        const key = `${to.q},${to.r}`;
        const old = ct.ownerIndex;

        if (old == null) {
            // Кажется логику с игроком надо перенести в его класс
            ct.power = cf.power - 1;
            cf.power = 1;
            ct.ownerIndex = this.currentDominatorIndex;
            pl.ownedCells.add(key);
            this.selected = {q: to.q, r: to.r};
            return;
        }

        if (old !== this.currentDominatorIndex) {
            const chance = this._getCaptureChance(cf.power - ct.power);
            if (Math.random() < chance) {
                // Кажется логику с игроком надо перенести в его класс
                this.dominators[old].ownedCells.delete(key);
                ct.ownerIndex = this.currentDominatorIndex;
                ct.power = Math.max(cf.power - ct.power, 1);
                cf.power = 1;
                pl.ownedCells.add(key);

                this.selected = {q: to.q, r: to.r};

                if (this.dominators[old].ownedCells.size === 0) {
                    this._eliminate(old);
                }
            } else {
                cf.power = 1;
                ct.power = Math.max(ct.power - cf.power, 1);
            }
        }
    }

    _tryUpgrade(q, r) {
        /**
         * Метод пытается улучшить клетку с координатами q, r, s = - q - r для текущего игрока
         * @param {number} q Первая координата
         * @param {number} e Вторая координата
         */
        if (this.capturePhase) return;

        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (!cell) return;

        const pl = this.currentDominator;
        const key = `${q},${r}`;
        const maxP = cell.size === 'big' ? 12 : 8;
        if (pl.ownedCells.has(key) && pl.influencePoints > 0 && cell.power < maxP) {
            cell.power++;
            pl.influencePoints--;
        }
    }

    _autoUpgrade() {
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

    _emitState() {
        /**
         * Вызывает событие изменения поля. Используется для отрисовки
         */
        this.dispatchEvent(new CustomEvent('stateChanged', {
            detail: this.getState()
        }));
    }
}
