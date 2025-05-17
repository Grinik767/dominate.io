const msg = sessionStorage.getItem('errorMsg');
document.getElementById('errorMsg').textContent = msg || 'Возникла неизвестная ошибка';