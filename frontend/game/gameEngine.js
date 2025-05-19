export class Game extends EventTarget {
    constructor(radius, players) {
        super();
        this.radius        = radius;
        this.players       = players;
        this.currentPlayer = 0;
        this.capturePhase  = true;
        this.selected      = null;
        this.cells         = this._generateField();
        this._placeStartingCells();
    }

    _generateField() {
        const out = [];
        for (let q = -this.radius; q <= this.radius; q++) {
            for (let r = Math.max(-this.radius, -q - this.radius);
                 r <= Math.min(this.radius, -q + this.radius);
                 r++
            ) {
                if (Math.random() < 0.2) continue;
                out.push({
                    q, r, s: -q - r,
                    power: 0,
                    ownerIndex: null,
                    size: Math.random() < 0.2 ? 'big' : 'small'
                });
            }
        }
        return out;
    }

    _placeStartingCells() {
        this.players.forEach((pl, idx) => {
            let cell;
            do {
                cell = this.cells[Math.floor(Math.random() * this.cells.length)];
            } while (cell.ownerIndex != null);
            cell.ownerIndex = idx;
            cell.power      = 2;
            pl.ownedCells.add(`${cell.q},${cell.r}`);
        });
    }

    getState() {
        return {
            cells: this.cells.map(c => ({ ...c })),
            players: this.players.map(p => ({
                color: p.color,
                influencePoints: p.influencePoints,
                ownedCells: new Set(p.ownedCells)
            })),
            currentPlayer: this.currentPlayer,
            capturePhase: this.capturePhase,
            selected: this.selected ? { ...this.selected } : null
        };
    }

    isOver() {
        return this.players.length <= 1;
    }

    canCapture(from, to) {
        const dirs = [
            { q: +1, r: -1 }, { q: +1, r: 0 }, { q: 0, r: +1 },
            { q: -1, r: +1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
        ];
        const dq = to.q - from.q, dr = to.r - from.r;
        if (!dirs.some(d => d.q === dq && d.r === dr)) return false;
        const pl = this.players[this.currentPlayer];
        return from.power > 1 && !pl.ownedCells.has(`${to.q},${to.r}`);
    }

    makeMove(move) {
        switch (move.type) {
            case 'select':
                this._select(move.q, move.r);
                break;
            case 'capture':
                this._capture(move.from, move.to);
                break;
            case 'upgrade':
                this._upgrade(move.q, move.r);
                break;
            case 'autoUpgrade':
                this._autoUpgrade();
                break;
            case 'endPhase':
                this._endPhase();
                break;
        }

        if (this.selected) {
            const sel = this.cells.find(c => c.q === this.selected.q && c.r === this.selected.r);
            if (!sel || sel.power <= 1) this.selected = null;
        }

        this._emitState();

        if (this.isOver()) {
            this.dispatchEvent(new CustomEvent('gameOver', {
                detail: { winner: this.players[0].color }
            }));
        }
    }

    _select(q, r) {
        if (!this.capturePhase) return;
        const key = `${q},${r}`;
        const pl  = this.players[this.currentPlayer];
        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (cell && cell.power > 1 && pl.ownedCells.has(key)) {
            this.selected = { q, r };
        }
    }

    _capture(from, to) {
        const cf = this.cells.find(c => c.q === from.q && c.r === from.r);
        const ct = this.cells.find(c => c.q === to.q   && c.r === to.r);
        if (!cf || !ct) return;
        const pl  = this.players[this.currentPlayer];
        const key = `${to.q},${to.r}`;
        const old = ct.ownerIndex;

        if (old != null && ct.power === 0) {
            this.players[old].ownedCells.delete(key);
            ct.ownerIndex = null;
        }

        if (ct.ownerIndex == null) {
            ct.power      = cf.power - 1;
            cf.power      = 1;
            ct.ownerIndex = this.currentPlayer;
            pl.ownedCells.add(key);
            this.selected = { q: to.q, r: to.r };
            return;
        }

        if (old !== this.currentPlayer && this.canCapture(cf, ct)) {
            const chance = this._captureChance(cf.power - ct.power);
            if (Math.random() < chance) {
                this.players[old].ownedCells.delete(key);
                ct.ownerIndex = this.currentPlayer;
                ct.power      = Math.max(cf.power - ct.power, 1);
                cf.power      = 1;
                pl.ownedCells.add(key);
                this.selected = { q: to.q, r: to.r };
                if (this.players[old].ownedCells.size === 0) {
                    this._eliminate(old);
                }
            } else {
                cf.power = 1;
                ct.power = Math.max(ct.power - cf.power, 1);
            }
        }
    }

    _upgrade(q, r) {
        if (this.capturePhase) return;
        const cell = this.cells.find(c => c.q === q && c.r === r);
        if (!cell) return;
        const pl   = this.players[this.currentPlayer];
        const key  = `${q},${r}`;
        const maxP = cell.size === 'big' ? 12 : 8;
        if (pl.ownedCells.has(key) && pl.influencePoints > 0 && cell.power < maxP) {
            cell.power++;
            pl.influencePoints--;
        }
    }

    _autoUpgrade() {
        const pl = this.players[this.currentPlayer];
        while (pl.influencePoints > 0) {
            const upg = [];
            for (const key of pl.ownedCells) {
                const [q, r] = key.split(',').map(Number);
                const c      = this.cells.find(c => c.q===q && c.r===r);
                const maxP   = c.size==='big'?12:8;
                if (c.power < maxP) upg.push(c);
            }
            if (!upg.length) break;
            const c = upg[Math.floor(Math.random()*upg.length)];
            c.power++;
            pl.influencePoints--;
        }
    }

    _endPhase() {
        if (this.capturePhase) {
            this.players[this.currentPlayer]
                .influencePoints += this.players[this.currentPlayer].ownedCells.size;
        } else {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        }
        this.capturePhase = !this.capturePhase;
        this.selected     = null;
    }

    _eliminate(idx) {
        this.players.splice(idx, 1);
        this.cells.forEach(c => {
            if      (c.ownerIndex === idx) c.ownerIndex = null;
            else if (c.ownerIndex > idx)   c.ownerIndex--;
        });
        this.dispatchEvent(new CustomEvent('playerEliminated',{
            detail:{ index: idx }
        }));
        if (this.currentPlayer >= idx) {
            this.currentPlayer = Math.max(0, this.currentPlayer - 1);
        }
    }

    _captureChance(d) {
        if      (d <= -2) return 0;
        else if (d === -1) return 0.25;
        else if (d ===  0) return 0.5;
        else if (d ===  1) return 0.75;
        return 1;
    }

    _emitState() {
        this.dispatchEvent(new CustomEvent('stateChanged',{
            detail: this.getState()
        }));
    }
}
