import {makeFadeOut, makeFadeIn} from "./utils.js";

const msg = sessionStorage.getItem('errorMsg');
document.getElementById('errorMsg').textContent = msg || 'Возникла неизвестная ошибка';

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        makeFadeOut();
    }
});