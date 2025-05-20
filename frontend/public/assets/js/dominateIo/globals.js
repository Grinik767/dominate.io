export const directions = [
    {q: +1, r: -1}, {q: +1, r: 0}, {q: 0, r: +1},
    {q: -1, r: +1}, {q: -1, r: 0}, {q: 0, r: -1}
]

export const DEFAULT_SIZE = 8;
export const BIG_SIZE = 8;

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomColors(size) {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#F0F', '#0FF',
        '#FF33A8', '#A833FF', '#2a8a5f', '#FFD700', '#8B0000', '#006400',
        '#4B0082', '#FF8C00', '#2E8B57',
    ];

    if (size > colors.length) {
        throw new Error(`Requested size (${size}) exceeds available unique colors (${colors.length})`);
    }

    const shuffled = [...colors].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}