export const directions = [
    {q: +1, r: -1}, {q: +1, r: 0}, {q: 0, r: +1},
    {q: -1, r: +1}, {q: -1, r: 0}, {q: 0, r: -1}
]

export const DEFAULT_SIZE = 8;
export const BIG_SIZE = 8;

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
