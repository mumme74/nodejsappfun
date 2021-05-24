export { BluetoothUart }

//https://gist.github.com/kotobuki/f549dbab67e3cb5754fa1285c6683c3d#file-web-bluetooth-test-for-micro-bit-markdown

// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
const ACCELEROMETER_SERVICE_UUID = "e95d0753-251d-470a-a062-fa1922dfa9a8";
const ACCELEROMETER_DATA_UUID = "e95dca4b-251d-470a-a062-fa1922dfa9a8";
const EVENT_SERVICE_UUID = "e95d93af-251d-470a-a062-fa1922dfa9a8";
const EVENT_MBIT_EVENT_UUID = "e95d9775-251d-470a-a062-fa1922dfa9a8";
const BLE_UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; //to send TO the microbit
const BLE_UART_RX_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; //to send TO the microbit
const BLE_UART_TX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; //to receive data FROM the microbit


let uBitDevice;

class BluetoothUart {
    messenger = null;
    static instance;
    rxCharacteristic = null;
    txCharacteristic = null;
    static rxCallback = () => {};
    static onInitialized = () => {};
    static onDisconnected = (event) => {
        BluetoothUart.instance.log("GATT server disconnected (Bluetooth)");
    };
    static onConnected = (event) => {
        BluetoothUart.instance.log("GATT server connected (Bluetooth)");
    };
    _sendTmr = null;
    _pendingCounter = 0;

    static async init(messenger) {
        let self = new BluetoothUart();
        if (uBitDevice)
            return self.log("Bluetooth already initialized");

        BluetoothUart.instance = self;
        self.messenger = messenger;

        try {
            console.log("Requesting Bluetooth Device...");
            uBitDevice = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: "BBC micro:bit" },
                    { services: [EVENT_SERVICE_UUID]}
                ],
                optionalServices: [BLE_UART_SERVICE]
            });

            // event callbacks when we are connected
            uBitDevice.addEventListener('gattserverdisconnected', e=>BluetoothUart.onDisconnected(e));
            uBitDevice.addEventListener('gattserverconnected', e=>BluetoothUart.onConnected(e));

            // e.g. BBC micro:bit [votiv]
            self.log("Connected to " + uBitDevice.name);

            self.log("Connecting to GATT Server...");
            const server = await uBitDevice.gatt.connect();
            
            
            console.log("Get event service");
            const eventService = await server.getPrimaryService(EVENT_SERVICE_UUID);
            const eventList = await eventService.getCharacteristic(EVENT_MBIT_EVENT_UUID);
            let eventVlu = await eventList.readValue();

            self.log("Getting Service...");
            const service = await server.getPrimaryService(BLE_UART_SERVICE);

            // TX relates to Microbit, so Tx here gets recived via WebBluetooth
            self.log("Getting MBIT Tx Characteristics...");
            self.txCharacteristic = await service.getCharacteristic(BLE_UART_TX_CHARACTERISTIC);
            self.txCharacteristic.startNotifications();
            self.txCharacteristic.addEventListener(
                "characteristicvaluechanged",
                ev => {
                    let value = ev.target.value;
                    let vluStr = new TextDecoder().decode(value);
                    BluetoothUart.rxCallback(vluStr);
                }
            );
            
            self.log("Getting Rx Characteristics...");
            self.rxCharacteristic = await service.getCharacteristic(BLE_UART_RX_CHARACTERISTIC);
            
            BluetoothUart.onInitialized();

        } catch (error) {
            self.log(error);
            uBitDevice = null;
        }

        return uBitDevice && uBitDevice.gatt.connected;
    }

    static reset() {
        BluetoothUart.instance = null;
        uBitDevice = null;
    }
    
    send(key, value) {
        if (!this.rxCharacteristic) 
            return;
        let cmdStr = key + value +'\n';
        let encoder = new TextEncoder('utf-8');
        let encStr = encoder.encode(cmdStr);
        // be gentle to mbit, we might drown it in commands
        if (this._sendTmr) {
            clearTimeout(this._sendTmr);
            this._pendingCounter++;
        }
        this._sendTmr = setTimeout(()=>{
            this.rxCharacteristic.writeValue(encStr);
            this._sendTmr = null;
            this._pendingCounter = 0;
        }, this._pendingCounter < 5 ? 70 : 0);
        //console.log('Send:' + encStr)
    }
    
    log(msg) {
        if (this.messenger)
            this.messenger.show(msg);
        return console.log(msg);
    }
}

