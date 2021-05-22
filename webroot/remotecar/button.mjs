export {Btn, KeyCode};

const KeyCode = {
    Down:40, Up: 38, Space:32, Left:37, Right:39
};

// detta är en controller som låter oss få repeat 
// (håll inne och då upprepas pressCallback)
class Btn {
    tmr = null;
    pressCallback = null;
    releaseCallback = null;

    constructor (btnId, pressCallback, releaseCallback, keyCode) {
        var btnNode = document.querySelector(btnId);
        this.pressCallback = pressCallback;
        this.releaseCallback = releaseCallback;
        // lyssna efter mustryckningar
        btnNode.addEventListener("mousedown", this.press.bind(this));
        btnNode.addEventListener("mouseup", this.release.bind(this));

        // lyssna på knapptryckningar
        if (keyCode) {
            var body = document.querySelector("body");
            body.addEventListener("keydown", (evt) => {
                if (evt.keyCode == keyCode) this.press();
            });
            body.addEventListener("keyup", (evt) => {
                if (evt.keyCode == keyCode) this.release();
            });
        }
    }

    press() {
        clearInterval(this.tmr);
        this.tmr = setInterval(()=>{
                this.pressCallback();
            }, 20);
    }
    release() {
        clearInterval(this.tmr);
        if (this.releaseCallback)
            this.releaseCallback();
    }
};
    
