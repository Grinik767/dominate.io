import {backendPreffix} from "../globals";

export class NetGameLogic {

    constructor(code, netPlayer, netOpponents) {
        this.code = code;
        this.socket = null;
        this.netPlayer = netPlayer;
        this.netOpponents = netOpponents;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(backendPreffix + `/Game?code${this.code}&nickname=${this.netPlayer.name}`);

        this.socket.onopen = () => {
            console.log("WebSocket connected in NetGameLogic");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const move = this._convertJsonToMove(data);
        };

        this.socket.onclose = () => {
            console.warn("WebSocket disconnected");
            window.location.href = "/index.html";
        };

        this.socket.onerror = (error) => {
            window.location.href = "/error.html";
        };
    }

    _convertJsonToMove(data){
        if (data.type === "GameMove") {

        }
        else if (data.type === "PhaseEnd") {

        }
        else if (data.type === "TurnEnd") {

        }

        return new Move();
    }

    _send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
