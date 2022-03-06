# nodejsappfun

## This is a app to connect webpages through websocket connection

This is used in a educational course I teach at school.


## Så här använder du denna API för att koppla ihop websidor

### I webbsidans huvud lägger du till:
```html
<script src="https://chat-zl3usdsnka-lz.a.run.app/socket.io/socket.io.js"></script>

```
Detta laddar ett script som används för att kommunicera med en appserver via websocket. Websocket är ett sätt att skicka meddelanden mellan en server och andra anslutna klienter.

### I ett script lägger du in:
Antingen inbäddat i sidan eller i ett extent script kan du sedan använda dessa kodsnuttar:
```javascript
const socket = io("wss://chat-zl3usdsnka-lz.a.run.app/", {transports: ['websocket']});
```
Detta skapar ett objekt som använder för att få meddelanden och ta emot meddelanden från andra som är anslutna till samma rum.

Tänk konceptet chatrum. Du kan ansluta till olika chattrum, vill du tex skapa en app som styr en funktion, vill du inte påverkas av en chatt.

Du kommer att vara ansluten upp till 1 timme. Därefter måste du ansluta igen.

### Info om anslutningen
```javascript
socket.on('connect', ()=>{
  console.log('connected');
  // ... your own code to run when we are connected
});
```
Denna händelse (event) anropas när vi är anslutna till seervern.


```javascript
socket.on('disconnect', ()=>{
  console.log('disconnected');
  // ... your own code to run when we are disconnected
});
```
Denna händelse anropas när vi anslutningen till server inte längre är uppkopplad. Tex när nätet går ned eller det har gått mer än 1 h.


```javascript
socket.on('reconnect', ()=>{
  console.log('reconnected');
  // ... your own code to run when we are reconnected
});
```
Denna händelse anropas när vi återigen ansluts till servern.


## Anslutning till ett rum
```javascript
socket.emit('signin', {user, room}, (error, history)=>{
  console.log('signin happend or a error');
  // your own code here
})
```
Så här gör du för att ansluta till ett rum.


Denna händelse händer när andra ansluter till samma rum
```javascript
socket.on('notification', ({title, description})=>{
  console.log('notification');
  // ... your own code to run when we are disconnected
  // title is what happened, description a longer text
});
```
Denna händelse anropas när det händer något, tex när en annan person ansluter till rummet, eller lämnar...


## Skicka information till servern
Det finns 2 olika typer av information som kan skickas till servern.
**message** och **data**.
**message** sparar meddelandet i minnet på servern, den är långsammare och lämpar sig mer för chat och text meddelanden

**data** är snabbare och lämpar sig mer för information som tex att någonting händer i och alla klienter skall uppdatera något. Tex flytta en gubbe i ett spel.



### Sända ett meddelande
```javascript
socket.emit('sendMessage', messageStr, (error)=>{
  console.log("sendMessage happened or a error");
  // your own code here
});
```

### Ta emot ett meddelande
```javascript
socket.on('message', ({user, text}))=>{
  console.log("message recieved from others");
  // your own code here
  // user is name of user, text is the message they sent
});
```
Denna händelse anropas när en annan användare säner ett meddelande


### Sända data
```javascript
const dataAsStr = JSON.stringify(data);
socket.emit('sendData', dataAsStr, (error)=>{
  console.log("sendData happened or a error");
  // your own code here
});
```

### Ta emot ett meddelande
```javascript
socket.on('data', ({user, dataAsStr}))=>{
  console.log("data recieved from others");
  const data = JSON.parse(dataAsStr);
  // your own code here
  // user is name of user, dataAsStr is the data they sent
});
```
Denna händelse anropas när en annan användare säner ett meddelande
