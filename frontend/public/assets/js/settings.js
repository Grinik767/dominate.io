document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('#nameInput');
    let playerName = sessionStorage.getItem('playerName');

    if (!playerName) {
        playerName = generateName(playerName);
    }
    input.value = playerName;
});