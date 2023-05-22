export class Arrows {
  constructor({
    north,northEast,east,southEast,
    south,southWest,west,northWest,
    loggerId, sendBoxId, sendBtnId
  }) {
    [north,northEast,east,southEast,south,southWest,west,northWest].forEach((id, i)=>{
      const btn = document.querySelector(id);
      btn.addEventListener('click', ()=>{
        this._send(i);
      });
    });
    this.loggerNode = document.querySelector(loggerId);
    this.sendBoxNode = document.querySelector(sendBoxId);
    this.sendBtnNode = document.querySelector(sendBtnId);
    this.sendBoxNode.addEventListener('keypress',(evt)=>{
      if (evt.keyCode === 13)
        this.sendCmd();
    })
    this.sendBtnNode.addEventListener('click', this.sendCmd.bind(this));

    this.conn = null;
  }

  setConnection(obj) {
    this.conn = obj;
  }

  sendCmd() {
    let vlu = this.sendBoxNode.value;
    vlu = vlu.replace(/\\x([0-9a-zA-Z]+)/g, (n)=>parseInt(n,16));
    this._send(vlu);
  }

  onRecieve(str) {
    this.loggerNode.value += `<-${str}\n`;
  }

  _send(num) {
    if (this.conn) {
      this.conn.send(num, "\n");
      this.loggerNode.value += `->${num}\n`;
    }
  }
}