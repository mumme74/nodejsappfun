export {Btn, KeyCode};

const KeyCode = {
    Down:40, Up: 38, Space:32, Left:37, Right:39
};

// detta är en controller som låter oss få repeat 
// (håll inne och då upprepas pressCallback)
class Btn {
    
    constructor (btnId, pressCallback, releaseCallback, keyCode) {
        var btnNode = document.querySelector(btnId);
        var self = this; // scope closure
        // lyssna efter mustryckningar
        btnNode.addEventListener("mousedown", this.press);
        btnNode.addEventListener("mouseup", this.release);

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
        this.press = function() {
            clearInterval(self.tmr);
            self.tmr = setInterval(function(){
                pressCallback();
            }, 20);
        }
        this.release = function() {
            clearInterval(self.tmr);
            if (releaseCallback)
                releaseCallback();
        }
    }
};
    
