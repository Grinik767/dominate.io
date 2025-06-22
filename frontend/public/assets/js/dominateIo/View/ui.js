import {Button, Display, DominatorList} from './components.js';
import {Player} from "../Agents/player.js";

export class UI {
    constructor(gameLogic, phaseButtonMove) {
        this.phaseBtn = new Button('phase-button');
        this.autoBtn = new Button('auto-upgrade');
        this.pointsLabel = new Display('points');
        this.currentPlayerLabel = new Display('player-color-name');
        this.dominatorsList = new DominatorList("dominators-list");
        this.exitButton = new Button('exit');

        this.exitButton.hide();
        this.autoBtn.hide();

        this.phaseBtn.onClick(() => {
            gameLogic.currentDominator.agent.submitMove(phaseButtonMove);
        });

        this.autoBtn.onClick(gameLogic.autoUpgrade.bind(gameLogic));

        gameLogic.addEventListener('gameOver', ev => this.showWinner(ev.detail.winner));

        this.dominatorsList.setDominators(gameLogic.state.dominators);
        this.dominatorsList.render();

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

        this.currentPlayerLabel.setText(`Ходит игрок: ${gameLogic.state.currentDominator.name}`);
        this.dominatorsList.setCurrentPlayer(gameLogic.state.currentDominator.index)
        this.currentPlayerLabel.setColor(gameLogic.state.currentDominator.color);
        this.pointsLabel.setText(`Очки влияния: ${gameLogic.state.currentDominator.influencePoints}`);

        if (!(gameLogic.state.currentDominator.agent instanceof Player)) {
            this.autoBtn.hide();
            this.phaseBtn.hide();
        } else {
            this.phaseBtn.show();
        }
    }

    showWinner(wiener) {
        this.phaseBtn.hide();
        this.autoBtn.hide();
        this.pointsLabel.setText("")

        this.currentPlayerLabel.setText(`Победил игрок: ${wiener.name.toUpperCase()}!`);
        this.exitButton.show();
        this.exitButton.setText("Выйти в главное меню");
        this.exitButton.onClick(() => {
            window.location.href = `/index.html`;
        })
    }
}