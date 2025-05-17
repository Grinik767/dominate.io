window.onload = function () {
    let playerName = localStorage.getItem('playerName');

    if (!playerName) {
        playerName = generateName();
        localStorage.setItem('playerName', playerName);
    }
};