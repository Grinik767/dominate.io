export class HexCell {
    constructor(cellData, players, hSpacing, vSpacing, centerX, centerY) {
        this.q          = cellData.q;
        this.r          = cellData.r;
        this.s          = cellData.s;
        this.sizeType   = cellData.size || 'small';
        this.power      = cellData.power;
        this.ownerIndex = cellData.owner;
        this.players    = players;

        const x = (this.q + this.r / 2) * hSpacing + centerX;
        const y = this.r * vSpacing + centerY;

        this.wrapper = document.createElement('div');
        this.wrapper.className = `hex-wrapper hex-${this.sizeType}`;
        this.wrapper.style.left = `${x}px`;
        this.wrapper.style.top  = `${y}px`;

        this.el = document.createElement('div');
        this.el.className = `hex-cell hex-${this.sizeType}`;
        this.wrapper.appendChild(this.el);

        this.el.addEventListener('click', () => {
            if (this.onClick) this.onClick(this);
        });

        this.updateVisual();
    }

    setClickHandler(fn) {
        this.onClick = fn;
    }

    setPower(value) {
        this.power = value;
        this.updateVisual();
    }

    setOwner(index) {
        this.ownerIndex = index;
        this.updateVisual();
    }

    clearOwner() {
        this.ownerIndex = null;
        this.updateVisual();
    }

    select() {
        this.el.classList.add('selected');
        this.wrapper.classList.add('selected');
    }

    deselect() {
        this.el.classList.remove('selected');
        this.wrapper.classList.remove('selected');
    }

    highlight() {
        this.wrapper.classList.add('highlight');
    }

    clearHighlight() {
        this.wrapper.classList.remove('highlight');
    }

    updateVisual() {
        this.el.dataset.q     = this.q;
        this.el.dataset.r     = this.r;
        this.el.dataset.s     = this.s;
        this.el.dataset.size  = this.sizeType;
        this.el.dataset.power = this.power;

        this.el.textContent = this.power;

        if (this.ownerIndex != null) {
            this.el.dataset.owner = this.ownerIndex;
            this.el.style.background = this.players[this.ownerIndex].color;
        } else {
            this.el.removeAttribute('data-owner');
            this.el.style.background = '#111';
        }
    }
}
