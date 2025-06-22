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

        fetch(backendPreffix + `/Lobby/${code}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(async response => {
                const data = await response.json().catch(() => null);

                if (response.ok) {
                    if (data?.isExist === false) {
                        throw new Error('Лобби не найдено');
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

    makeFadeIn();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        emulateButtonClick(buttonConnect);
    }
});