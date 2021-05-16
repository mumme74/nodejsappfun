export { WS };

// sätta upp websocket connection
class WS {
    prot = 'ws:';
    ws = null;
    callback = () => {};

    constructor(callback, messenger, user) {
        this.callback = callback;
        this.messenger = messenger || console.log;
      
        if (location.protocol === "https:")
            this.prot = 'wss:'
        this.ws = new WebSocket(this.prot + '//' + location.hostname + ':' + location.port + '/robotarm/');
        this.messenger.show("Försöker kontakta servern:" + this.ws.url);

        // sänd namnet när vi fått kontakt med servern
        this.ws.onopen = (e) => {
            this.ws.send(JSON.stringify({name: user.name}));
            this.messenger.show("Kontakt med server")
        }
        this.ws.onclose = (e) => { this.messenger.show("Kontakt bruten med server") }

        // ta emot ändringar från andra klienter
        this.ws.onmessage = (e) => {
            var json = JSON.parse(e.data);
            this.messenger.show(json.name + " styr just nu.")
            
            for (let key in json) {
                if (!isNaN(json[key]))
                    this.callback(key, json[key]);
            }
        }
    }
}

