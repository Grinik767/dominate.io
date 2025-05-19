import {BIG_SIZE} from "../globals.js";

export class ViewCell {
    constructor(cell, hSpacing, vSpacing, cx, cy, omClick) {
        this.cell = cell;

        const x = (cell.q + cell.r/2)*hSpacing + cx;
        const y = cell.r*vSpacing + cy;

        this.wrapper = document.createElement('div');

        let sizeType = cell.size === BIG_SIZE? 'big' : 'small';

        this.wrapper.className = `hex-wrapper hex-${sizeType}`;
        this.wrapper.style.left = x + 'px';
        this.wrapper.style.top  = y + 'px';

        this.el = document.createElement('div');
        this.el.className = `hex-cell hex-${sizeType}`;
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
        this.el.textContent = this.cell.power;

        if (this.cell.owner) {
            this.el.dataset.owner = this.cell.owner.index;
            this.el.style.background = this.cell.owner.color;
        } else {
            // TODO: Кажется data-owner не нужен уже
            this.el.removeAttribute('data-owner');
            this.el.style.background = '#111';
        }
    }
}
