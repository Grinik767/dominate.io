import {backendPreffixWS} from "./dominateIo/globals.js";
import {makeFadeOut, makeFadeIn} from "./utils.js";

const playerName = localStorage.getItem('playerName');
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
let users;
let socket;
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    localStorage.setItem('lastConnectionCode', code);

    if (!playerName) {
        sessionStorage.setItem('errorMsg', 'Отсутствует никнейм игрока');
        window.location.href = '/error.html';
        return;
    }

    setUpConnection(code);

    renderLobbyCode(code);

    makeFadeIn();
});

document.getElementById('readyButton').addEventListener('click', toggleReadyStatusOfPlayer)
document.getElementById('leaveButton').addEventListener('click', leaveLobby)

// window.addEventListener("beforeunload", function (e) {
//     closeConnection();
// });

document.getElementById("lobbyCode").addEventListener("click", function () {
    const h1 = this.querySelector("h1");
    const code = h1.innerText;

    navigator.clipboard.writeText(code)
        .then(() => {
            h1.classList.remove("click-animate");
            void h1.offsetWidth;
            h1.classList.add("click-animate");
        });
});


function setUpConnection(code) {
    try {
        const api = backendPreffixWS + "/Game?code=" + code + "&nickname=" + playerName;
        socket = new WebSocket(api);

        socket.addEventListener('open', () => {
            const joinMessage = {
                type: 'Join'
            };

            socket.send(JSON.stringify(joinMessage));

            const getPlayersMessage = {
                type: 'GetPlayers'
            };

            socket.send(JSON.stringify(getPlayersMessage));
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'SendPlayers':
                    users = Object.entries(data.players).map(([name, details]) => ({
                        name,
                        color: details.Color,
                        isReady: details.IsReady
                    }));
                    renderLobbyUsers();
                    break;
                case 'PlayerJoined':
                    if (playerName !== data.nickname) {
                        users.push({
                            name: data.nickname,
                            color: data.color,
                            isReady: false
                        })

                        renderLobbyUsers();
                    }
                    break;
                case 'Readiness':
                    if (data.nickname !== playerName) {
                        toggleReadyStatusFromNetClient(data.nickname, data.isReady);
                    }
                    break;
                case 'GameStarted':
                    sessionStorage.setItem('code', code);
                    sessionStorage.setItem('gameInfo', JSON.stringify(data));

                    const players = data.playersQueue.reduce((acc, name) => {
                        const user = users.find(u => u.name === name);
                        if (user) {
                            acc[name] = { "Color" : user.color };
                        }
                        return acc;
                    }, {});
                    sessionStorage.setItem('players', JSON.stringify(players));
                    // sessionStorage.removeItem('lobbyInfo');
                    window.location.href = '/onlineGame.html';
                    break;
                case 'PlayerLeft':
                    if (data.nickname !== playerName) {
                        const index = users.findIndex(u => u.name === data.nickname);
                        if (index !== -1) {
                            users.splice(index, 1);
                            renderLobbyUsers();
                        }
                    }
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        });

        socket.addEventListener('error', (err) => {
            console.error('WebSocket error:', err);
            sessionStorage.setItem('errorMsg', err.message);
            window.location.href = '/error.html';
        });

    } catch (error) {
        sessionStorage.setItem('errorMsg', error.message);
        window.location.href = '/error.html';
    }
}

function closeConnection() {
    const leaveMessage = {
        type: 'Leave'
    };
    socket.send(JSON.stringify(leaveMessage));
    socket.close();
}

function renderLobbyUsers() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    users.forEach(user => {
        const userRow = document.createElement('div');
        userRow.className = 'userRow';
        userRow.dataset.name = user.name;

        const text = document.createElement('p');
        text.innerText = user.name;
        userRow.appendChild(text);

        const indicator = document.createElement('span');
        indicator.className = 'indicator ' + (user.ready ? 'ready' : 'not-ready');
        userRow.appendChild(indicator);

        // indicator.classList.toggle('ready', user.isReady);

        if (user.name === playerName) {
            userRow.classList.add('playerRow');
        }

        playerList.appendChild(userRow);
    });
}

function renderLobbyCode(code) {
    const lobbyCode = document.getElementById('lobbyCode');
    const h1 = lobbyCode.querySelector('h1');
    h1.textContent = code;
}

function toggleReadyStatusOfPlayer() {
    const user = users.find(u => u.name === playerName);
    if (!user)
        throw Error("Игрок отсутсвует в списках игроков лобби");

    user.ready = !user.ready;

    toggleReadyStatusUI(user.name, user.ready);

    const switchReadinessMessage = {
        type: 'SwitchReadiness'
    };

    socket.send(JSON.stringify(switchReadinessMessage));
}

function toggleReadyStatusUI(name, isReady) {
    const userRow = document.querySelector(`.userRow[data-name="${name}"]`);
    if (userRow) {
        const indicator = userRow.querySelector('.indicator');
        indicator.classList.toggle('ready', isReady);
        indicator.classList.toggle('not-ready', !isReady);
    }
}

function toggleReadyStatusFromNetClient(name, isReady) {
    toggleReadyStatusUI(name, isReady);
}

function leaveLobby() {
    closeConnection();
    window.location.href = `/index.html`;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        makeFadeOut('createLobby.html');
    }
});