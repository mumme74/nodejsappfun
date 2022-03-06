"use strict";

const {redisClient} = require('./redis');
const pkg = require('../package');
const server = require('./app');

const PORT = parseInt(process.env.PORT) || 8080;

// start server
server.listen(PORT, ()=>{
  console.log(`${pkg.name}: listening on ${PORT}`);
});

server.on('SIGTERM', ()=>{
  // clean up rescources on shutdown
  console.log(`${pkg.name}: received SIGTERM`);
  redisClient.quit();
  process.exit(0);
});

module.exports = server;