let pressingButton = false;
let makingFadeOut = false;
export function generateName(){
    return "Player" + Math.floor(Math.random()*10000000);
}


export function makeFadeOut(toPage = 'index.html') {
    window.location.href = toPage;
    // if (makingFadeOut)
    //     return;
    // makingFadeOut = true;
    // console.log('Called fade out');
    // document.body.classList.add('fade-out');
    // setTimeout(() => {
    //     window.location.href = toPage;
    //     makingFadeOut = false;
    // }, 150);
}


export function makeFadeIn() {
    // console.log('Called fade in');
    // document.body.classList.remove('fade-out');
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
