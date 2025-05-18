let playerName = localStorage.getItem('playerName');

document.addEventListener('DOMContentLoaded', () => {
    if (!playerName) {
        playerName = generateName();
        localStorage.setItem('playerName', playerName);
    }
});

document.getElementById('createLobby').addEventListener('click', () => {
    fetch('/api/lobby/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({playerName})
    }).then(async response => {
        if (response.ok) {
            return response.json();
        }

        const errorData = await response.json().catch(() => null);
        const errorMsg = 'Неизвестная ошибка';

        throw new Error(errorMsg);
    }).then(code => {
        window.location.href = `/lobby.html?code=${code}`;
    })
    .catch(err => {
        sessionStorage.setItem('errorMsg', err);
        window.location.href = '/error.html';
    });
})