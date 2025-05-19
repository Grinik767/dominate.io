import {Button, Display} from './components.js';

export class UI {
    constructor(gameLogic) {
        this.phaseBtn = new Button('phase-button');
        this.autoBtn = new Button('auto-upgrade');
        this.pointsLabel = new Display('points');
        this.currentPlayerLabel = new Display('player-color-name');

        this.autoBtn.hide();

        this.phaseBtn.onClick(() =>
            gameLogic.currentDominator.agent.submitMove({type: 'endPhase'})
        );

        this.autoBtn.onClick(gameLogic.autoUpgrade);

        gameLogic.addEventListener('gameOver', ev => this.showWinner(ev.detail.winner));
    }

    showWinner(winner) {
        alert(`Победил игрок: ${winner.toUpperCase()}!`);
    }
}