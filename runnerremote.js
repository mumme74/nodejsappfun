
exports.onWsRequest = function(request) {
    var origin = request.origin + request.resource;
    console.log("origin:",request.resource, "runnerRemote");
    const connection = request.accept(null, request.origin);
    clients.add(connection);
    connection.userCls = new User(connection);
    
    connection.on('message', function(message) {
        //console.log('Received Message:', message);
        connection.userCls.process(message);
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client ' + connection.userCls.name + ' has disconnected.');
        connection.userCls.removeMe();
        clients.delete(connection);
    });
}

const clients = new Set();
let clientIds = 0;

const colors = [
    [0xfc,0xba,0x03], [0x66,0xd1,0x2c], [0xfc,0x20,0x03],
    [0x8d,0x96,0x24], [0x59,0xd9,0x6e], [0xd6,0x7f,0x2d],
    [0x72,0xed,0xbe], [0x31,0xbc,0xeb], [0x31,0x82,0xeb],
    [0x59,0x2e,0xdb], [0xb6,0x2e,0xdb], [0xd4,0x2c,0xb2],
    [0xd9,0x2b,0x6e], [0x2b,0x18,0x20]
];
const ID=0, NAME = 1, POSLEN = 2, COLCRASH = 3,
      REMOVE = 4, COLOR = 5;
class User {
    
    constructor(connection) {
        this.connection = connection;
        this.x = 20; this.y = 20;
        this.length = 0; this.crashes = 0;
        this.name = ""; this.isCollided = false;
        this.color = null;
        
        if (clientIds > 254) clientIds = 0;
        this.id = ++clientIds;
        // send our ID to browser
        let buf = Buffer.alloc(2);
        buf.writeUInt8(ID, 0);
        buf.writeUInt8(this.id, 1);
        connection.sendBytes(buf);
        
        // what color should we have?
        this.colorIdx = -1;
        let takenColors = [];
        for (let cl of clients)
            if (cl !== connection)
                takenColors.push(cl.userCls.colorIdx);
        
        for (let i = 0; i < colors.length; ++i) {
            if (takenColors.indexOf(i) == -1) {
                this.colorIdx = i;
                break;
            }
        }
        this.color = colors[this.colorIdx];
        
        let colBuf = Buffer.alloc(5);
        colBuf.writeUInt8(COLOR, 0);
        colBuf.writeUInt8(this.id, 1);
        colBuf.writeUInt8(this.color[0], 2); // red
        colBuf.writeUInt8(this.color[1], 3); // green
        colBuf.writeUInt8(this.color[2], 4); // blue
        connection.sendBytes(colBuf);
        console.log("color",this.color)
    }
    process(msg) {
        if(msg.type == 'binary')
            return this.processArrayBuffer(msg);
        
        console.debug("invalid msg",msg)
    }
    processArrayBuffer(msg) {
        let buf = msg.binaryData;
        let msgType = buf.readUInt8(0);
        //console.log(msgType);
        switch(msgType) {
        case NAME:
            this.setName(buf);
            break;
        case POSLEN:
            this.setPos(buf);
            break;
        case COLCRASH:
            this.setCrash(buf);
            break;
        default:
            console.log("unrecognized msg type:" + msgType);
        }
    }
    removeMe() {
        let buf = Buffer.alloc(2);
        buf.writeUInt8(REMOVE, 0);
        buf.writeUInt8(this.id, 1);
        this._sendBuffer(buf);
        console.log("Player:", this.id, this._name, " closed")
    }
    _sendBuffer(arrBuf) {
        for (let client of clients) {
            if (client.userCls !== this)
                client.sendBytes(arrBuf);
        }
    }
    setName(buf){
        let nbuf = Buffer.alloc(buf.length - 2);
        buf.copy(nbuf, 0, 2);
        buf.writeUInt8(this.id, 1);
        this._name = nbuf.toString('utf-8');
        console.log("new player with id:", this.id, "name", this._name);
        this._sendBuffer(buf);
        this._sendBuffer(this._mkColorPkt());
        // notify old clients of me
        for (let client of clients) {
            if (client.userCls !== this)
                client.userCls.broadcast(this.connection);
        }
    }
    setPos(buf) {
        this.x = buf.readUInt16BE(2);
        this.y = buf.readUInt16BE(4);
        this.length = buf.readUInt32BE(6);
        this._sendBuffer(buf);
    }
    setCrash(buf) {
        this.crashes = buf.readUInt16BE(2);
        this.isCrashed = Boolean(buf.readUInt8(4));
        this._sendBuffer(buf);
    }
    
    broadcast(connection) {
        // sänd mina värden till connection
        // precis ansluten
        connection.sendBytes(this._mkNamePkt());
        connection.sendBytes(this._mkPosLenPkt());
        connection.sendBytes(this._mkCrashesPkt());
        connection.sendBytes(this._mkColorPkt());
        
        console.log("broadcast",this._name,"to", connection.userCls._name)
    }
    _mkNamePkt() {
        let nameBuf = Buffer.from(this._name, 'utf-8');
        let buf = Buffer.alloc(nameBuf.byteLength + 2);
        buf[0] = NAME;
        buf[1] = this.id;
        nameBuf.copy(buf, 2, 0);
        return buf;
    }
    _mkPosLenPkt() {
        let bufPos = Buffer.alloc(10);
        bufPos[0] = POSLEN;
        bufPos[1] = this.id;
        bufPos.writeUInt16BE(this.x, 2);
        bufPos.writeUInt16BE(this.y, 4);
        bufPos.writeUInt32BE(this.length, 6);
        return bufPos;
    }
    _mkCrashesPkt() {
        let bufCrashes = Buffer.alloc(5);
        bufCrashes[0] = COLCRASH;
        bufCrashes[1] = this.id;
        bufCrashes.writeUInt16BE(this.crashes, 2);
        bufCrashes.writeUInt8(Number(this.isCrashed), 4);
        return bufCrashes;
    }
    _mkColorPkt() {
        let bufColor = Buffer.alloc(5);
        bufColor[0] = COLOR;
        bufColor[1] = this.id;
        bufColor[2] = this.color[0];
        bufColor[3] = this.color[1];
        bufColor[4] = this.color[2];
        return bufColor;
    }
}

