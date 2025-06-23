let pressingButton = false;
let makingFadeOut = false;
export function generateName(){
    return "Player" + Math.floor(Math.random()*10000000);
}


export function makeFadeOut(toPage = 'index.html') {
    window.location.href = toPage;
}


export function makeFadeIn() {
    // console.log('Called fade in');
    // document.body.classList.remove('fade-out');
}

export function isValidPlayerName(playerName) {
    const regex = /^[a-zA-Z0-9_-]{1,20}$/;
    return regex.test(playerName);
}

export function emulateButtonClick(btn) {
    if (pressingButton)
        return;
    pressingButton = true;
    btn.classList.remove('active');
    btn.classList.add('active');
    btn.click();

    setTimeout(() => {
        pressingButton = false;
        btn.classList.remove('active');
    }, 200);
}
