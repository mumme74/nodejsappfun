export { Serial};

let port;

class Serial {
    static instance;
    messenger = null;
    static initialized = false;
    static onInitialized = () => {};
    static onConnected = () => {};
    static onDisconnected = () => {};
    outputStream = null;
    
    // gemensam sänd function för Serial bluetooth eller USB
    async send(key, value) {
        const writer = this.outputStream.getWriter();
        writer.write(key + value + '\n');
        writer.releaseLock();
    }
        
    static async init(messenger) {
        if (this.initialized) 
            return this.messenger("Web serial är redan initialiserad");

        let self = new Serial(); // create a new singleton
        self.instance = self;
        self.messenger = messenger;
        
        if ("serial" in navigator) {
            // fråga användare om vilken serieport, ställ in baudrate etc.
            port = await navigator.serial.requestPort();
            await port.open({baudRate: 115200});
            
            port.addEventListener('connnect', self.onConnected);
            port.addEventListener('disconnect', self.ondisconnected)

            const encoder = new TextEncoderStream();
            let outputDone = encoder.readable.pipeTo(port.writable);
            this.outputStream = encoder.writable;

            this.initialized = outputDone && this.outputStream;
            Serial.onInitialized();
            
        } else
            self.log("Web Serial är inte aktiverat. Måste aktiveras först");

        return port && port.writable;
    };
    
    log(msg) {
        if (this.messenger)
            this.messenger.show(msg);
        console.log(msg);
    }

    static reset() {
        port = null;
        Serial.instance = null;
    }
}
