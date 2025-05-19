export class Cell {
    constructor(q, r, s, size) {
        this.q = q;
        this.r = r;
        this.s = s;
        this.size = size;

        this.owner = null;
        this.power = 0;
    }
}