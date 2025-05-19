export class Button {
    constructor(id) { this.el = document.getElementById(id); }
    onClick(fn)     { this.el.addEventListener('click', fn); }
    setText(t)      { this.el.textContent = t; }
    show()          { this.el.style.display = 'inline-block'; }
    hide()          { this.el.style.display = 'none'; }
}

export class Display {
    constructor(id)       { this.el = document.getElementById(id); }
    setText(t)      { this.el.textContent = t; }
    setColor(c)     { this.el.style.color = c; }
}

export class GameBoard {
    constructor(id)       { this.container = document.getElementById(id); }
    clear()         { this.container.innerHTML = ''; }
    append(node)    { this.container.appendChild(node); }
    setSize(w,h)    {
        this.container.style.width  = w + 'px';
        this.container.style.height = h + 'px';
    }
}
