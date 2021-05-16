
exports.onWsRequest = function(request) {
    console.log("here")
    const connection = request.accept(null, request.origin);
    clients.add(connection);
    connection.userCls = new User(connection);
    
    connection.on('message', function(message) {
        //console.log('Received Message:', message);
        connection.userCls.process(message);
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client ' + connection.userCls.name + ' has disconnected.');
        clients.delete(connection);
    });
}

const clients = new Set();
let clientIds = 0;


class User {
    constructor(connection) {
        this.connection = connection;
        this.name = "";
        
        if (clientIds > 254) clientIds = 0;
        this.id = ++clientIds;
        console.log("new connection");
    }
    
    process(msg) {
        if (msg.type == 'base64')
            this.streamVideo(msg);
        else if(msg.type === 'utf8') {
            let oMsg = JSON.parse(msg.utf8Data);
            this.broadcastChanges(oMsg);
        } else
            console.debug("invalid msg", msg, " msg.type:", msg.type);
    }
    
    broadcastChanges(oMsg) {
        // set name of this client
        if (!this.name) {
            if (oMsg.name)
                this.name = oMsg.name;
        } else
            oMsg.name = this.name;
        
        // notfy all other listeners
        for (let client of clients) {
            if (client.userCls !== this)
                client.send(JSON.stringify(oMsg));
        }
    }
    
    streamVideo(msg) {
        // notfy all other listeners
        for (let client of clients) {
            if (client.userCls !== this)
                client.send(JSON.stringify(msg));
        }
    }
}

