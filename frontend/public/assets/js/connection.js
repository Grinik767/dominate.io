document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.btn');
    const input = document.querySelector('.inp');
    const errorMessage = document.querySelector('.errorMessage');

    button.addEventListener('click', () => {
        const code = input.value.trim();
        if (!code) {
            alert('Введите имя');
            return;
        }

        fetch('/api/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка соединения');
                }
                return response.json();
            })
            .then(data => {
                window.location.href = `/lobby.html?sessionId=${data["sessionId"]}`;
            })
            .catch(error => {
                input.classList.add('denied');
                errorMessage.textContent = error.message;
            });
    });
});