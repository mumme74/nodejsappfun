"use strict";

const url = location.protocol === 'file:' ? "wss://chat-zl3usdsnka-lz.a.run.app/" : '';

const socket = io(url, {transports: ['websocket']});


// reconnect when clicking connect button
document.querySelector("#connectIcon")
  .addEventListener('click', async ()=>{
    if (socket.connected)
      await socket.disconnect();
    else
      await socket.connect();
})

// make a nofifier widget at top of page
const log = function(arg) {
  const div = document.createElement("div");
  div.textContent = arg;
  div.classList.add('notifier');
  document.body.appendChild(div);
  log._timeout = setTimeout(()=>{
    div.parentElement.removeChild(div);
  }, 2000);
  console.log(arg);
}

// helper functions
// this one recreates previous history in chat
function addHistory(messages) {
  messages.forEach(addMsg);
}

// sets what chatroom we are currently in
function setChatroom(room) {
  document.querySelector("#chatroom>h1").textContent = room;
}

// adds a message to the messages log (previous messsages)
function addMsg(msg) {
  // find to conatiner for all old messages
  const msgs = document.querySelector("#messages");
  const tmpl = document.createElement("template");
  tmpl.innerHTML = `<li><b>${msg.title||msg.user}:</b> ${msg.text||msg.description}</li>`;
  msgs.append(tmpl.content); // append templates content
  window.scrollTo(0, document.body.scrollHeight); // scroll window to correct place
}

// this gets called each time our user tries to join a chatroom
document.querySelector("#signinFrm").addEventListener('submit', evt =>{
  evt.preventDefault(); // stop this event from clearing the page (while submitting)
  // findout what user has entered as values to chatroom
  const user = document.querySelector("#userName").value,
        room = document.querySelector("#chatRoom").value;
  if (!user  || ! room)
    return alert("Du har inte anget namn eller chattrum!");

  // notify our server that we want to join this chatroom
  socket.emit('signin', {user, room}, (error, history)=>{
    if (error)
      return log(error);

    // load the prevous history of chat messages
    if (history) addHistory(history.messages);
    // load chatroom messages
    setChatroom(room);
    document.body.classList.add("joined"); // hide login form, show messages and send (using pure css selectors)
    window.scrollTo(0, document.body.scrollHeight); // scroll to place
  });
});

// This gets called each time our user presses send
document.querySelector("#chatFrm").addEventListener('submit', (evt)=>{
  evt.preventDefault(); // stop this form from reloading the page
  const msg = document.querySelector("#chatMsg");
  if (!msg.value) return log("Inget att sända!");
  socket.emit('sendMessage', msg.value, (error)=>{
    // when send got through or had an error
    if (error)
      return log(error);
    // clear sent msg from input, indicate to user we have sent it
    msg.value = "";
  });
});

// Listen for new messages
socket.on('message', addMsg);

// Listen for notifications
socket.on('notification', addMsg);

socket.on('connect', ()=>{
  log('connected');
  document.body.classList.add('connected');
});

socket.on('disconnect', (err)=>{
  log('server disconnected');
  document.body.classList.remove('joined');
  document.body.classList.remove('connected');
  document.querySelector("#messages").innerHTML = "";
});

socket.on('reconnect', ()=>{
  log('reconnected');
  // Emit updateSocketIdEvent
  socket.emit('updateSocketId', {user, room}, (error)=>{
    if (error) return log(error);
  });
});

