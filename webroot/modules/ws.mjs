export { WS };

// sätta upp websocket connection
class WS {
    prot = 'ws:';
    ws = null;
    callback = () => {};
    messenger = null;
    url = null;
    user = null;
    onConnected = (e)=>{}
    onDisconnected = (e)=>{}

    constructor(callback, messenger, user, url) {
        this.callback = callback;
        this.messenger = messenger || console.log;
        this.user = user;

        if (location.protocol === "https:")
            this.prot = 'wss:';

        if (!url) {
            this.url = this.prot + '//' + location.hostname + ':' + location.port + '/robotarm/';
        } else {
            this.url = url;

            // get port and protocol from url
            const regex = /(?:(ws:|wss:)\/\/)?[a-zA-Z0-9]+:(\d+)\//;
            let m = url.match(regex);
            if (m.length > 2) {
                this.prot = m[1];
                this.port = m[2];
            } else if (m.length > 1)
                this.port = m[1];

        }
    }

    connect() {
        this.messenger.show("Försöker kontakta servern:" + this.url);
        try {
            this.ws = new WebSocket(this.url);
        } catch(e) {
            return false;
        }

        // sänd namnet när vi fått kontakt med servern
        this.ws.onopen = (e) => {
            this.ws.send(JSON.stringify({name: this.user.name}));
            this.messenger.show("Kontakt med server via " + this.url);
            this.onConnected(e);
        }
        this.ws.onclose = (e) => {
            this.messenger.show("Kontakt bruten med server");
            this.onDisconnected(e);
        }

        // ta emot ändringar från andra klienter
        this.ws.onmessage = (e) => {
            var json = JSON.parse(e.data);
            this.messenger.show(json.name + " styr just nu.")
            
            for (let key in json) {
                //if (!isNaN(json[key]))
                    this.callback(key, json[key]);
            }
        }

        return true;
    }

    send(str) {
        if (this.ws)
            this.ws.send(str);
    }
}

