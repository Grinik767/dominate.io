document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.btn');
    const input = document.querySelector('.inp');
    const errorMessage = document.querySelector('.errorMessage');

    button.addEventListener('click', () => {
        const code = input.value.trim();
        if (!code) {
            input.classList.add('denied');
            errorMessage.textContent = "Недопустимый код лобби";
            errorMessage.classList.add('visible');
            return;
        }

        fetch('/api/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        })
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }

                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData?.errorMsg || 'Неизвестная ошибка соединения';

                if (response.status === 404) {
                    throw new Error('Лобби не найдено');
                }
                if (response.status === 405) {
                    throw new Error(errorMsg);
                }

                throw new Error(errorMsg);
            })
            .then(data => {
                errorMessage.textContent = '';
                errorMessage.classList.remove('visible');
                input.classList.remove('denied');
                window.location.href = `/lobby.html?sessionId=${data["sessionId"]}`;
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
});