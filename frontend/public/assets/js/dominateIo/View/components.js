/**
 * Кнопка
 */
export class Button {
    constructor(id) { this.el = document.getElementById(id); }
    onClick(fn)     { this.el.addEventListener('click', fn); }
    setText(t)      { this.el.textContent = t; }
    show()          { this.el.style.display = 'inline-block'; }
    hide()          { this.el.style.display = 'none'; }
}

/**
 * Поле текста
 */
export class Display {
    constructor(id)       { this.el = document.getElementById(id); }
    setText(t)      { this.el.textContent = t; }
    setColor(c)     { this.el.style.color = c; }
}

/**
 * Represents a dominateIo board container that manages rendering and sizing. One in all dominateIo
 */
export class GameBoard {
    constructor(id)       { this.container = document.getElementById(id); }
    clear()         { this.container.innerHTML = ''; }
    append(node)    { this.container.appendChild(node); }
    setSize(w,h)    {
        this.container.style.width  = w + 'px';
        this.container.style.height = h + 'px';
    }
}

export class DominatorList {
    constructor(id) {
        this.el = document.getElementById(id);
        this.dominators = [];
        this.currentIndex = -1;
    }

    setDominators(dominators) {
        this.dominators = dominators;
        this.render();
    }

    setCurrentPlayer(index) {
        if (index >= 0 && index < this.dominators.length) {
            this.currentIndex = index;
            this.render();
        }
    }

    render() {
        this.el.innerHTML = '';

        this.dominators.forEach((dominator, index) => {
            const domElement = document.createElement('div');
            domElement.className = 'dominator';
            if (index === this.currentIndex) {
                domElement.classList.add('current');
            }

            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = dominator.name;

            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = dominator.color;

            domElement.appendChild(name);
            domElement.appendChild(colorBox);
            this.el.appendChild(domElement);
        });
    }

    show() {
        this.el.style.display = 'block';
    }

    hide() {
        this.el.style.display = 'none';
    }
}
