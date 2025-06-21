export class NetClient {

    constructor(url, netPlayers) {
        this.url = url;
        this.socket = null;
        this.netPlayers = netPlayers;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket connected in NetClient");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "GameMove") {
            } else if (data.type === "PhaseEnd") {
            } else if (data.type === "TurnEnd") {
            }
        };

        this.socket.onclose = () => {
            console.warn("WebSocket disconnected");
            this.emit("disconnected");
        };

        this.socket.onerror = (error) => {
        };
    }

    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
