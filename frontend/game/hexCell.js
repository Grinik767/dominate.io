// hexCell.js
export class HexCell {
    constructor(data, players, hSpacing, vSpacing, cx, cy) {
        this.q          = data.q;
        this.r          = data.r;
        this.sizeType   = data.size;
        this.power      = data.power;
        this.ownerIndex = data.ownerIndex;
        this.players    = players;

        const x = (this.q + this.r/2)*hSpacing + cx;
        const y = this.r*vSpacing + cy;

        this.wrapper = document.createElement('div');
        this.wrapper.className = `hex-wrapper hex-${this.sizeType}`;
        this.wrapper.style.left = x + 'px';
        this.wrapper.style.top  = y + 'px';

        this.el = document.createElement('div');
        this.el.className = `hex-cell hex-${this.sizeType}`;
        this.wrapper.appendChild(this.el);

        this.el.addEventListener('click', ()=> {
            if (this.onClick) this.onClick(this);
        });

        this.updateVisual();
    }

    setClickHandler(fn) { this.onClick = fn; }
    setPower(v)         { this.power = v; this.updateVisual(); }
    setOwner(i)         { this.ownerIndex = i; this.updateVisual(); }
    select()            { this.el.classList.add('selected'); this.wrapper.classList.add('selected'); }
    deselect()          { this.el.classList.remove('selected'); this.wrapper.classList.remove('selected'); }
    highlight()         { this.wrapper.classList.add('highlight'); }
    clearHighlight()    { this.wrapper.classList.remove('highlight'); }

    updateVisual() {
        this.el.dataset.q     = this.q;
        this.el.dataset.r     = this.r;
        this.el.dataset.size  = this.sizeType;
        this.el.dataset.power = this.power;
        this.el.textContent   = this.power;

        if (this.ownerIndex != null) {
            this.el.dataset.owner = this.ownerIndex;
            this.el.style.background = this.players[this.ownerIndex].color;
        } else {
            this.el.removeAttribute('data-owner');
            this.el.style.background = '#111';
        }
    }
}
