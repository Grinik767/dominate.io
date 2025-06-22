export function generateName(){
    return "Player" + Math.floor(Math.random()*10000000);
}


export function makeFadeOut(toPage = 'index.html') {
    document.body.classList.remove('loaded');
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = toPage;
    }, 150);
}


export function makeFadeIn() {
    document.body.classList.remove('fade-out');
    document.body.classList.add('loaded');
}
