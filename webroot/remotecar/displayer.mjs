export {car, obstacle};

const svgWidth = 400,
      svgHeight = 500;
      
class Car {
    carNode = null;
    vectorTurnNode = null;
    vectorSpeedNode = null;
    textNode = null;
    translateX = 0;
    translateY = 0;
    speed = 0; //(-511) - 511
    dir = 0; // (-100) - 100 // straight=0
    onSpeedChange = () => {};
    onDirChange = () => {};
    
    constructor() {
        this.carNode = document.querySelector("#car");
        this.vectorTurnNode = document.querySelector("#vectorTurn");
        this.vectorSpeedNode = document.querySelector("#vectorSpeed");
        this.textNode = document.querySelector("#svgText");
        // get car default translation
        const re = /.*translate\(([0-9]+)px\s*,\s+([0-9]+)px\)/;
        let match = this.carNode.style.transform.match(re);
        if (match.length > 2) {
            this.translateX = parseInt(match[1]);
            this.translateY = parseInt(match[2]);
        }
    }
    
    setDir(vlu) {
        vlu = Math.max(Math.min(vlu, 100), -100);
        if (this.dir !== vlu) {
            this.dir = vlu;
            // rotate car
            let rot = Math.round(vlu * 1.8, 0);
            this.carNode.style.transform = 
                'translate(' + this.translateX + 'px, ' + 
                               this.translateY + 'px) ' +
                'rotate(' + rot  + 'deg)';
            this._update();
            this.onDirChange();
        }
    }
    
    setSpeed(vlu) {
        vlu = Math.max(Math.min(vlu, 511), -511);
        if (this.speed !== vlu) {
            this.speed = vlu;
            this._update();
            this.onSpeedChange();
        }
    }
    
    left() { this.setDir(this.dir-1); }
    right() { this.setDir(this.dir+1); }
    forward() { this.setSpeed(this.speed +5); }
    reverse() { this.setSpeed(this.speed -5); }
    
    _update(){
        let speed = Math.round(this.speed / 5.11, 0);
        let dir = Math.round(this.dir * 1.8, 0);
        this.textNode.textContent = 'speed:' + speed + '% dir:' + dir + 'deg';
        
        // move turn bar
        let x2 =  this.dir * 1.5;
        this.vectorTurnNode.x2.baseVal.value = x2 + (svgWidth / 2);
        
        // prevent turn from dragging speed bar
        let factor = (100 - (this.dir < 0 ? -this.dir : this.dir)) / 100;
        let y2 = Math.round(this.speed / 2, 0) * factor;
        // move speed bar
        this.vectorSpeedNode.y2.baseVal.value = this.vectorSpeedNode.y1.baseVal.value  - y2;
    }
}

class Obstacle {
    constructor() {
 
    }
}

var car = new Car(),
    obstacle = new Obstacle();

