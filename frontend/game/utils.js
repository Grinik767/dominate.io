function getHexNeighbors(index, gridSize) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const even = row % 2 === 0;

    const offsets = even
        ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
        : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];

    const neighbors = offsets.map(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            return r * gridSize + c;
        }
        return null;
    }).filter(i => i !== null);

    return neighbors;
}
