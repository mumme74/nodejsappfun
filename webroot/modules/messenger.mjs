export { Messenger }

// info banner
class Messenger {
    node = null;
    _tmr = null;
    constructor(nodeId, styleClass) {
        this.node = document.getElementById(nodeId);
        if (!this.node) {
            this.node = document.createElement("div");
            document.body.prepend(this.node);
        }
        
        if (!styleClass) {
            let style = document.createElement("style");
            let txt = document.createTextNode("._info {\
                position: fixed;\
                opacity:0.5;\
                text-align: center;\
                background-color: yellow;\
                width:100%;\
                color:blue;\
            }");
            style.append(txt);
            document.head.append(style);
            styleClass = "_info";
        }
        
        this.node.className = styleClass;
    }
    show(msgStr) {
        clearInterval(this._tmr);
        this.node.innerHTML = msgStr;
        this.node.style.opacity = 1;
        this._tmr = setInterval(()=>{
            this.node.style.opacity -= 0.05;
            if (this.node.style.opacity <= 0.0)
                clearInterval(this._tmr);
        }, 200);
    }
}

