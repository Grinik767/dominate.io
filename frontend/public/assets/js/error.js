import {makeFadeOut, makeFadeIn} from "./utils.js";
import {AudioPlayer} from "./audioManager.js";

const msg = sessionStorage.getItem('errorMsg');
document.getElementById('errorMsg').textContent = msg || 'Возникла неизвестная ошибка';

AudioPlayer.playSound("error");

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        makeFadeOut();
    }
});