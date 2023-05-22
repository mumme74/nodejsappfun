export { Serial};

let port;

class Serial {
    static instance;
    messenger = null;
    static initialized = false;
    static onInitialized = () => {};
    static onConnected = () => {};
    static onDisconnected = () => {};
    static rxCallback = () => {};
    outputStream = null;

    // gemensam sänd function för Serial bluetooth eller USB
    async send(key, value) {
        const writer = this.outputStream.getWriter();
        writer.write(key + value + '\n');
        writer.releaseLock();
    }

    static async init(messenger) {
        const _this = Serial.instance
        if (_this?.initialized)
            return _this.messenger("Web serial är redan initialiserad");

        let self = new Serial(); // create a new singleton
        Serial.instance = self;
        self.messenger = messenger;

        if ("serial" in navigator) {
            // fråga användare om vilken serieport, ställ in baudrate etc.
            self.port = port = await navigator.serial.requestPort();
            await port.open({baudRate: 115200});

            port.addEventListener('connnect', self.onConnected);
            port.addEventListener('disconnect', self.ondisconnected)

            const encoder = new TextEncoderStream();
            let outputDone = encoder.readable.pipeTo(port.writable);
            self.outputStream = encoder.writable;

            Serial.initialized = outputDone && this.outputStream;
            Serial.onInitialized();
            setTimeout(self._readFromPort.bind(self), 10);
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

    async _readFromPort(){
        const enc = new TextDecoder();
        while (this.port.readable) {
            const reader = this.port.readable.getReader();
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) {
                  // |reader| has been canceled.
                  break;
                }
                try {
                    const str = enc.decode(value);
                    Serial.rxCallback(str);
                } catch(e) {
                    console.error(e);
                }
              }
            } catch (error) {
              // Handle |error|...
            } finally {
              reader.releaseLock();
            }
          }
    }
}
