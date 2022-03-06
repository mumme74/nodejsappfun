"use strict";

const { promisify } = require('util');

// [START cloudrun_websockets_redis]
const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

console.log("REDISHOST", REDISHOST);

let redisGet, redisExists, redisClient;
  // instantiate the Redis client
  const redis = require('redis');
  redisClient = redis.createClient({
    url: `redis://${REDISHOST}:${REDISPORT}`,
  });

(async ()=>{

  redisClient.on("error", function(error) {
    console.error(`❗️ Redis Error: ${error}`)
  });

  redisClient.on("ready", () => {
    console.log('✅ 💃 redis have ready !')
  });

  redisClient.on("connect", () => {
    console.log('✅ 💃 connect redis success !')
  });
  await redisClient.connect();

  // set up the promises and async/await for redis methods
  redisGet = /*promisify(*/redisClient.get/*)*/.bind(redisClient);
  redisExists = /*promisify(*/redisClient.exists/*)*/.bind(redisClient);
})();
// [END cloudrun_websockets_redis]


// insert new messages into the Redis cache
async function addMessageToCache(roomName, msg) {
  // check the current cache
  let room = await getRoomFromCache(roomName);
  if (room) {
    // update old room
    room.messages.push(msg);
  } else {
    // create a new room
    room = {
      room: roomName,
      messages: [msg]
    };
  }

  redisClient.set(roomName, JSON.stringify(room));
  // insert msg to database as well
  addMessageToDb(room);
}

// query Redis for a specific room
// if not in Redis, query database
async function getRoomFromCache(roomName) {
  if (!(await redisExists(roomName))) {
    const room = getRoomFromDatabase(roomName);
    if (room) {
      redisClient.set(roomName, JSON.stringify(room));
    }
  }
  return JSON.parse(await redisGet(roomName));
}

// in memory database example
// should probably use a real persistent storage for this one
const messageDb = [
  {
    room: 'my-room',
    messages: [
      {user:'sven', text: 'Hi from Sven'},
      {user:'bertil', text: 'Youooo sven'},
      {user:'anis', text: 'How is your crib?'}
    ]
  }
];

async function addMessageToDb(data) {
  const room = messageDb.find(doc=>doc.room===data.room);
  if (room) {
    // update room in database
    Object.assign(room, data);
  } else {
    // create a new room in database
    messageDb.push(data);
  }
}

function getRoomFromDatabase(roomName) {
  return messageDb.find(doc=>doc.room===roomName);
}

module.exports = { getRoomFromCache, addMessageToCache, redisClient };
