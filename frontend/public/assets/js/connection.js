import {backendPreffix} from "./dominateIo/globals.js";
import {makeFadeOut, makeFadeIn, emulateButtonClick} from "./utils.js";

let buttonConnect;

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            makeFadeOut();
        }
    });

    const name = localStorage.getItem("playerName");

    buttonConnect = document.querySelector('.btn');
    const input = document.querySelector('.inp');
    const errorMessage = document.querySelector('.errorMessage');

    const lastConnectionCode = localStorage.getItem('lastConnectionCode');
    if (lastConnectionCode != null) {
        input.value = lastConnectionCode;
    }

    buttonConnect.addEventListener('click', () => {
        const code = input.value.trim();
        if (!code) {
            input.classList.add('denied');
            errorMessage.textContent = "Недопустимый код лобби";
            errorMessage.classList.add('visible');
            return;
        }

        console.log()
        fetch(backendPreffix + `/Lobby/${code}/${name}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(async response => {
                const data = await response.json().catch(() => null);
                if (response.ok) {
                    if (data?.isExist === false) {
                        throw new Error('Лобби не найдено.');
                    }
                    if (data?.hasFreeSpace === false) {
                        throw new Error('В лобби нет мест.');
                    }
                    if (data?.canJoin === false) {
                        throw new Error('С таким никнеймом нельзя подключиться.');
                    }
                    return data;
                }

                const errorMsg = data?.errorMsg || 'Неизвестная ошибка соединения';
                throw new Error(errorMsg);
            })
            .then(data => {
                errorMessage.textContent = '';
                errorMessage.classList.remove('visible');
                input.classList.remove('denied');

                window.location.href = `/lobby.html?code=${code}`;
            })
            .catch(error => {
                input.classList.add('denied');
                errorMessage.textContent = error.message;
                errorMessage.classList.add('visible');
            });
    });

    input.addEventListener('input', e => {
        input.classList.remove('denied');
        errorMessage.textContent = "";
        errorMessage.classList.remove('visible');
    })

    input.focus();

    makeFadeIn();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        emulateButtonClick(buttonConnect);
    }
});