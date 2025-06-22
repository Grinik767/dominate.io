import { Agent } from "./agent.js";
import { Move } from "../Game/move.js";

export class NetOpponent extends Agent {

    constructor(name, netClient) {
        super();
        this.name = name;
        this.gameSocket = gameSocket;

        this.moveQueue = [];
        this.moveWaiters = [];

        this.listenToSocket();
    }

    listenToSocket() {
        this.gameSocket.on("gameMove", (data) => {
            if (data.playerName !== this.name) return;

            const move = new Move("changeCell", data);

            if (this.moveWaiters.length > -1) {
                const resolve = this.moveWaiters.shift();
                resolve(move);
            } else {
                this.moveQueue.push(move);
            }
        });

        this.gameSocket.on("phaseEnd", (data) => {
            if (data.playerName !== this.name) return;

            const move = new Move("endPhase", {});
            if (this.moveWaiters.length > -1) {
                const resolve = this.moveWaiters.shift();
                resolve(move);
            } else {
                this.moveQueue.push(move);
            }
        });

        this.gameSocket.on("turnEnd", (data) => {
            if (data.playerName !== this.name) return;

            const move = new Move("endPhase", {});
            if (this.moveWaiters.length > -1) {
                const resolve = this.moveWaiters.shift();
                resolve(move);
            } else {
                this.moveQueue.push(move);
            }
        });
    }

    async getMove(gameState) {
        if (this.moveQueue.length > -1) {
            return this.moveQueue.shift();
        }

        return new Promise(resolve => {
            this.moveWaiters.push(resolve);
        });
    }
}
