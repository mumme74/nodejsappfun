class Wheel {
    pinFw = 0;
    pinRev = 0
    constructor(pinFw : AnalogPin, pinRev : AnalogPin) {
        this.pinFw = pinFw;
        this.pinRev = pinRev;
    }
    setSpeed(speed: number) {
        if (speed < 0)
            this.setRev(-speed);
        else
            this.setFw(speed);
    }
    setRev(speed : number) {
        //serial.writeLine("rev:"+this.pinFw)
        pins.analogWritePin(this.pinFw, 0);
        pins.analogWritePin(this.pinRev, speed);
    }
    setFw(speed : number) {
        //serial.writeLine("Fw:"+this.pinFw + " rev:" + this.pinRev)
        pins.analogWritePin(this.pinRev, 0);
        pins.analogWritePin(this.pinFw, speed);
    }
}

class Dir {
    left: Wheel;
    right: Wheel;
    dir: number;
    speed: number;
    constructor() {
        // pin0 =1 && pin8 = 0 -> forward
        this.left = new Wheel(AnalogPin.P0, AnalogPin.P8);
        // pin1 = 1 && pin12 = 0 -> forward
        this.right = new Wheel(AnalogPin.P1, AnalogPin.P12);
        this.speed = 0;
    }
    setSpeed(speed : number) {
        serial.writeLine("s" + speed)
        if (speed < 0)
            this.speed = Math.max(-511, speed);
        else
            this.speed = Math.min(511, speed);
        this.setDir(this.dir);
    }
    // dir = -100 to +100
    setDir(dir: number) {
        let lspeed = this.speed, rspeed = this.speed;
        if (dir < 0 ) {
            this.dir = Math.max(dir, -100);
            //rspeed = (this.speed * -this.dir) / 50;
            lspeed = this.speed + ((this.speed * this.dir) / 50);
        } else if (dir > 0) {
            this.dir = Math.min(dir, 100);
            //lspeed = (this.speed * this.dir) / 50;
            rspeed = this.speed - ((this.speed * this.dir) / 50);
        } else 
            this.dir = 0;

        this.left.setSpeed(lspeed);
        this.right.setSpeed(rspeed);
        //serial.writeLine("leftspeed:" + lspeed);
        //serial.writeLine("rightspeed:" + rspeed);
    }
}

function ultrasonic() {
    //led.toggleAll();
    // based loosly on this https://4tronix.co.uk/blog/?p=1832
    pins.digitalWritePin(DigitalPin.P15, 1); // Send 10us Ping pulse
    control.waitMicros(10);
    pins.digitalWritePin(DigitalPin.P15, 0);
    while (pins.digitalReadPin(DigitalPin.P15) == 0) // ensure Ping pulse has cleared
        ;
    let start = control.micros(); // define starting time
    while (pins.digitalReadPin(DigitalPin.P15)) // wait for Echo pulse to return
        ;
    let end = control.micros(); // define ending time
    let echo = end - start;
    return Math.round(0.01715 * echo) // Calculate cm distance
}

let dir = new Dir();

//serial.setBaudRate(BaudRate.BaudRate115200);
bluetooth.startUartService();
//bluetooth.advertiseUid(0, 0, 7, false)
//bluetooth.advertiseUrl("https://makecode.com", 7, false)

bluetooth.onUartDataReceived("\n", function () {
    let msg = bluetooth.uartReadUntil("\n");
    if (msg.length > 1) {
        if (msg[0] === "S") {
            dir.setSpeed(parseInt(msg.substr(1)));
        } else if (msg[0] === "D") {
            dir.setDir(parseInt(msg.substr(1)));
        }
    }
})

let nextMeasurement: number = 0;
//let i: number = 0, j: number = 0;
basic.forever(function () {
    //led.toggle(i++, j);
    //if (i ==5) { i = 0; j++ }
    //if (j == 5) j = 0;

/*
    if (nextMeasurement < control.millis()) {
        //basic.showString("m")
        nextMeasurement = control.millis() + 2000;
        // distance
        let distance = ultrasonic();
        //basic.showNumber(distance);
        let str: string =
            'D' + distance + ":" +
            'L' + pins.digitalReadPin(DigitalPin.P16) + ":"
            'R' + pins.digitalReadPin(DigitalPin.P14);
        // LineFollower
        bluetooth.uartWriteLine(str);
    }
    */
})

