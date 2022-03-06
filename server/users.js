"use strict";

// local record of users
const users = new Map();

function addUser(id, name, room) {
  if (!name && !room) return new Error("Username and room are required!");
  if (!name) return new Error("Username is required!");
  if (!room) return new Error("Room is required!");
  users.set(id, {user: name, room});
}

// return the user's name and chat room form socket id
function getUser(id) {
  return users.get(id) || {};
}

// delete user record
function deleteUser(id) {
  const user = getUser(id);
  users.delete(id);
  return user;
}


module.exports = {addUser, getUser, deleteUser};
