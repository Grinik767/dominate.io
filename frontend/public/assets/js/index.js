import {makeFadeOut, makeFadeIn, generateName} from "./utils.js";
let playerName = localStorage.getItem('playerName');
let currentIndex = 0; // Moved to global scope
const menuItems = document.querySelectorAll('.menuItem');


document.addEventListener('DOMContentLoaded', () => {
    if (!playerName) {
        playerName = generateName();
        localStorage.setItem('playerName', playerName);
    }

    updateSelection();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'w', 'W'].includes(e.key)) {
            currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            updateSelection();
            e.preventDefault();
        } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
            currentIndex = (currentIndex + 1) % menuItems.length;
            updateSelection();
            e.preventDefault();
        } else if (e.key === 'Enter') {
            const link = menuItems[currentIndex].querySelector('a');
            if (link) {
                e.preventDefault();
                makeFadeOut(link.getAttribute('href'));
            }
        }
    });

    // Mouse interactions
    menuItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            currentIndex = index;
            updateSelection();
        });

        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                makeFadeOut(link.getAttribute('href'));
            });
        }
    });

    makeFadeIn();
});

function updateSelection() {
    menuItems.forEach((item, i) => {
        const isSelected = i === currentIndex;
        item.classList.toggle('selected', isSelected);
        item.querySelector('.indicator').classList.toggle('selected', isSelected);
    });
}