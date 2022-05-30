
exports.onWsRequest = function(request) {
    console.log("here")
    const connection = request.accept(null, request.origin);
    clients.push(connection);
    connection.userCls = new User(connection);
    
    connection.on('message', function(message) {
        //console.log('Received Message:', message);
        connection.userCls.process(message);
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client ' + connection.userCls.name + ' has disconnected.');
        clients.splice(clients.indexOf(connection),1);
        if (connection.userCls.isHost) {
            connection.userCls.broadcastChanges({hangUp:true});
        } else { 
            for (let c of clients) {
                let user = c.userCls;
                if (user.isHost) {
                    let idx = user.subscribers.indexOf(connection.userCls);
                    if (idx > -1) {
                        user.subscribers.splice(idx, 1);
                    }
                }
            }
        }
    });
}

const clients = [];
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
            this.request(oMsg);
        } else
            console.debug("invalid msg", msg, " msg.type:", msg.type);
    }
    
    request(oMsg) {
        
        // set name of this client
        if (!this.name) {
            if (oMsg.name)
                this.name = oMsg.name;
        } else
            oMsg.name = this.name;
            
        if (oMsg.request) {
            switch (oMsg.request) {
            case "listHosts": return this.listHosts();
            case "setAsHost": return this.setAsHost();
            case "connectToHost": return this.connectToHost(oMsg.host);
            }
        }
        this.broadcastChanges(oMsg);
    }
    
    listHosts() {
        let hosts = clients.map(
           c=>c.userCls.isHost ? c.userCls.name : undefined).filter(h=>h);
        this.connection.send(JSON.stringify({hosts}));
    }
    
    setAsHost() {
        this.isHost = true;
        this.subscribers = [];
        console.log(this.name + " is now host");
    }
    
    connectToHost(host) {
        this.connectedTo = clients.find(c=>c.userCls.name==host && c.userCls.isHost).userCls;
        console.log("connect to " + host);
        this.connectedTo.subscribers.push(this);
        this.connection.send(JSON.stringify({connectedTo:host}));
    }
    
    broadcastChanges(oMsg) {
        const payload = JSON.stringify(oMsg);
            
        if (this.connectedTo)
            return this.connectedTo.connection.send(payload);
        
        if (this.isHost) {
            for (const sub of this.subscribers)
                sub.connection.send(payload);
            return;
        }
        
        // notfy all other listeners
        for (let client of clients) {
            if (client.userCls !== this)
                client.send(payload);
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

