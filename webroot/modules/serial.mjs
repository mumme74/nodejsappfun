export { Serial, ttySingleton };

var ttySingleton;

class Serial {
    messenger = null;
    static initialized = false;
    static onInitialized = () => {};
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
        ttySingleton = new Serial(); // create a new singleton
        ttySingleton.messenger = messenger;
        
        if ("serial" in navigator) {
            // fråga användare om vilken serieport, ställ in baudrate etc.
            const port = await navigator.serial.requestPort();
            await port.open({baudRate: 115200});
            //const wrSerial = port.writable.getWriter();
            
            const encoder = new TextEncoderStream();
            outputDone = encoder.readable.pipeTo(port.writable);
            this.outputStream = encoder.writable;
            
            this.initialized = outputDone && this.outputStream;
            this.onInitialized();
            
        } else
            ttySingleton.log("Web Serial är inte aktiverat. Måste aktiveras först");
    };
    
    log(msg) {
        if (this.messenger)
            this.messenger.show(msg);
        console.log(msg);
    }
}
