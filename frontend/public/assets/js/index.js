let playerName = localStorage.getItem('playerName');

document.addEventListener('DOMContentLoaded', () => {
    if (!playerName) {
        playerName = generateName();
        localStorage.setItem('playerName', playerName);
    }
});