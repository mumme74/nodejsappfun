const http = require('https');
const fs = require('fs'); //require filesystem module
const url = require('url');
const path = require('path');
const mime = require('mime');
const WebSocketServer = require('websocket').server;
const runner = require('./runnerremote');
const robotarm = require('./robotarm');
//const stream = require('./stream'); 

const options = {
  key: fs.readFileSync('./tls/server.key'),
  cert: fs.readFileSync('./tls/server.crt'),
  ca: fs.readFileSync("./tls/rootCA.crt")
};


let server = http.createServer(options, handler);
server.addListener('upgrade', (req, res, head)=> {
    console.log('UPGRADE:', req.url);
});
server.on('error', (err) => console.error(err));
server.listen(8080); //listen to port 8080
console.log("serving on https://localhost:8080");

function errNotFound(err, res) {
  console.log(err);
  res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
  return res.end("404 Not found");
}

function handler (req, res) { //create server
  let q = url.parse(req.url, true);
  let p = '/webroot' + q.pathname;
  if (q.pathname[q.pathname.length-1] == path.sep)
      p += 'index.htm';
console.log(p);
  fs.lstat(__dirname + p, (err, stats) => {
    if (err) return console.log(err);
    if (stats.isDirectory()) {
        if (err) return errNotFound(err, res);
        
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write('<h1>' + q.pathname + '</h1>\r\n');
        
        fs.readdir(__dirname + p, (err, files) => {
          if (err) return errNotFound(err, res);
          console.log(files);
          files.forEach(file => {
            res.write('<a href='+ q.pathname + '/' + file + '>' + file +'</a><br/>\r\n');
          })
          return res.end();
        });
       
    } else if (stats.isFile()) {
      fs.readFile(__dirname + p, (err, data) => { //read file index.html in public folder
        if (err) return errNotFound(err, res);        
        let contentType = mime.lookup ? mime.lookup(__dirname + p) : mime.getType(__dirname + p);
        res.writeHead(200, {'Content-Type': contentType || 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
      });
    }
  })
}

const wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', function(request) {
    var origin = request.origin + request.resource;
    console.log("origin:",request.resource);
    if (request.resource == "/runnerremote/")
        runner.onWsRequest(request);
    else if (request.resource == "/robotarm/")
        robotarm.onWsRequest(request);
    else if (request.resource == "/stream/")
        stream.onWsRequest(request);
});


