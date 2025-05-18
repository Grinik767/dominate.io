export class Button {
    constructor(id) {
        this.el = document.getElementById(id);
    }
    onClick(fn) {
        this.el.addEventListener('click', fn);
    }
    setText(text) {
        this.el.textContent = text;
    }
    show() {
        this.el.style.display = 'inline-block';
    }
    hide() {
        this.el.style.display = 'none';
    }
}

export class Display {
    constructor(id) {
        this.el = document.getElementById(id);
    }
    setText(text) {
        this.el.textContent = text;
    }
    setColor(color) {
        this.el.style.color = color;
    }
}

export class GameBoard {
    constructor(id) {
        this.container = document.getElementById(id);
    }
    clear() {
        this.container.innerHTML = '';
    }
    append(node) {
        this.container.appendChild(node);
    }
    setSize(width, height) {
        this.container.style.width  = `${width}px`;
        this.container.style.height = `${height}px`;
    }
}
