export class ViewCell {
    constructor(cell, hSpacing, vSpacing, cx, cy, omClick) {
        this.cell = cell;

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
            omClick(cell);
        });

        this.updateVisual();
    }

    select()            { this.el.classList.add('selected'); this.wrapper.classList.add('selected'); }
    deselect()          { this.el.classList.remove('selected'); this.wrapper.classList.remove('selected'); }
    highlight()         { this.wrapper.classList.add('highlight'); }
    clearHighlight()    { this.wrapper.classList.remove('highlight'); }

    updateVisual() {
        /**
         * Обновляем клетку в html
         */
        this.el.textContent   = this.cell.power;

        if (this.cell.ownerIndex != null) {
            this.el.dataset.owner = this.ownerIndex;
            this.el.style.background = this.players[this.ownerIndex].color;
        } else {
            this.el.removeAttribute('data-owner');
            this.el.style.background = '#111';
        }
    }
}
