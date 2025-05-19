const playerName = localStorage.getItem('playerName');
const sessionId = sessionStorage.getItem('sessionId');
let lobbyInfo = {}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!sessionId) {
        sessionStorage.setItem('errorMsg', 'Отсутствует ID лобби');
        window.location.href = '/error.html';
        return;
    }
    if (!playerName) {
        sessionStorage.setItem('errorMsg', 'Отсутствует никнейм игрока')
        window.location.href = '/error.html';
        return;
    }

    // Step 1: Request Lobby Info
    setUpConnection(sessionId, code);
});

document.getElementById('readyButton').addEventListener('click', toggleReadyStatus)
document.getElementById('leaveButton').addEventListener('click', leaveLobby)


function setUpConnection(sessionId, code) {
    fetch(`/api/lobby?code=${code}`)
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('Ошибка соединения');
        })
        .then(lobInfo => {
            lobbyInfo = lobInfo;

            const player = { name: playerName, ready: false };
            lobbyInfo.users.push(player);

            console.log(lobbyInfo);

            renderLobbyUsers(lobbyInfo);
            renderLobbyCode(code);
        })
        .catch(err => {
            sessionStorage.setItem('errorMsg', err);
            window.location.href = '/error.html';
        });
}

function renderLobbyUsers(lobbyInfo){
    const playerList = document.getElementById('playerList');

    lobbyInfo.users.forEach(user => {
        const userRow = document.createElement('div');
        userRow.className = 'userRow';

        const text = document.createElement('p');
        text.innerText = user.name;
        userRow.appendChild(text);

        const indicator = document.createElement('span');
        indicator.className = 'indicator ' + (user.ready ? 'ready' : 'not-ready');

        userRow.appendChild(indicator);
        playerList.appendChild(userRow);

        if (user.name === playerName) {
            userRow.classList.add('playerRow');
            userRow.id = "userRow";
        }
    });
}

function renderLobbyCode(code){
    const lobbyCode = document.getElementById('lobbyCode');
    const h1 = lobbyCode.querySelector('h1');
    h1.textContent = code;
}

function toggleReadyStatus() {
    const indicator = document.querySelector('#userRow span');
    const user = lobbyInfo.users.find(user => user.name === playerName);

    user.ready = !user.ready;

    if (indicator) {
        indicator.classList.toggle('ready', user.ready);
        indicator.classList.toggle('not-ready', !user.ready);
    }
}

function leaveLobby() {
    window.location.href = `/index.html`;
}