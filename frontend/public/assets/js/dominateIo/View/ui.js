import {Button, Display} from './components.js';
import {Player} from "../Agents/player.js";

export class UI {
    constructor(gameLogic) {
        this.phaseBtn = new Button('phase-button');
        this.autoBtn = new Button('auto-upgrade');
        this.pointsLabel = new Display('points');
        this.currentPlayerLabel = new Display('player-color-name');

        this.autoBtn.hide();

        this.phaseBtn.onClick(() => {
            gameLogic.currentDominator.agent.submitMove({type: 'endPhase'});
        });

        this.autoBtn.onClick(gameLogic.autoUpgrade.bind(gameLogic));

        gameLogic.addEventListener('gameOver', ev => this.showWinner(ev.detail.winner));

        this.update(gameLogic);
    }

    update(gameLogic) {
        if (gameLogic.state.capturePhase) {
            this.phaseBtn.setText('Перейти к фазе прокачки');
            this.autoBtn.hide();
        } else {
            this.phaseBtn.setText('Передать ход');
            this.autoBtn.show();
        }

        this.currentPlayerLabel.setText(gameLogic.state.currentDominator.name);
        this.currentPlayerLabel.setColor(gameLogic.state.currentDominator.color);
        this.pointsLabel.setText(gameLogic.state.currentDominator.influencePoints);

        if (!(gameLogic.state.currentDominator.agent instanceof Player)) {
            this.autoBtn.hide();
            this.phaseBtn.hide();
        } else {
            this.phaseBtn.show();
        }
    }

    showWinner(wiener) {
        alert(`Победил игрок: ${wiener.name.toUpperCase()}!`);
    }
}