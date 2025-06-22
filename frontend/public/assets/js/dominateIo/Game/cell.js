import {BIG_SIZE} from "../globals.js";

export class Cell {
    constructor(q, r, s, size) {
        this.q = q;
        this.r = r;
        this.s = s;
        this.size = size;

        this.owner = null;
        this.power = 0;
    }

    toDictionary() {
        return {
            q: this.q,
            r: this.r,
            s: this.s,
            power: this.power,
            owner: this.owner.name,
            size: this.size === BIG_SIZE,
        }
    }

    get key() {
        return `${this.q},${this.r}`;
    }
}