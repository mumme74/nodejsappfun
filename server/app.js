"use strict";
// from https://cloud.google.com/run/docs/tutorials/websockets
const express = require("express");
const {redisClient, getRoomFromCache, addMessageToCache} = require('./redis');
const {addUser, getUser, deleteUser} = require('./users');
const path = require("path");

const staticDir = path.resolve(__dirname, '../client/');

const app = express();
app.use(express.static(staticDir));

// serve frontend
app.get('/', async (req, res)=>{
  res.sendFile(path.resolve(staticDir, 'chat.html'));
});

// initiaialize websockets io
const server = require("http").Server(app);
const io = require("socket.io")(server);


// initialize redis to syncronize messages between instances
const redisAdapter = require("@socket.io/redis-adapter");
// replace in memory adapter with redis
io.adapter(redisAdapter(redisClient, redisClient.duplicate()));

// listen for a new connection
io.on('connection', socket => {
  // add listener for signin event
  socket.on('signin', async ({user, room}, callback) => {
    try{
      // record socker ID to users name and chat room
      addUser(socket.id, user, room);
      // call join to subscribe to a given channel
      socket.join(room);
      // Emit notification event
      socket.in(room).emit('notification', {
        title: "Somone's here",
        description: `${user} just entered the room`
      });
      // Retrieve room's message history or return null
      const messages = await getRoomFromCache(room);
      // use the callback to respond with the room's message history
      // Callbacks are more commonly used for event listeners than promises
      callback(null, messages);
    } catch (err) {
      console.log(err)
      callback(err, null);
    }
  });

  // Add listener for "updateSocketId" event
  socket.on('updateSocketId', async ({user, room}) =>{
    try {
      addUser(socket.id, user, room);
      socket.join(room);
    } catch(err) {
      console.error(err);
    }
  });

  socket.on('sendMessage', async (message, callback) => {
    // Retrieve user's name and chat room from socket Id
    const {user, room} = getUser(socket.id);
    if (room) {
      const msg = {user, text: message};
      // push message to clients in chat room
      io.in(room).emit('message', msg);
      addMessageToCache(room, msg);
      callback();
    } else {
      callback('User session not found');
    }
  });

  socket.on('sendData', async (data, callback) => {
    // Retrieve user's name and chat room from socket Id
    const {user, room} = getUser(socket.id);
    if (room) {
      const msg = {user, dataAsStr:data};
      // push message to clients in chat room
      io.in(room).emit('data', msg);
      callback();
    } else {
      callback('User session not found');
    }
  });

  socket.on('disconnect', ()=>{
    // remove socket ID from list
    const {user, room} = deleteUser(socket.id);
    if (user) {
      io.in(room).emit('notification', {
        title: "Someone's just left",
        description: `${user} just left the room`
      });
    }
  })
});

module.exports = server;
