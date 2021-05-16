export { user };

class User {
    name = null;
    constructor() {
        this.name = location.hash.substring(1);
        if (!this.name) {
            this.name = prompt("Ditt namn?");
            location.hash = this.name;
        }
    }
}

var user = new User();
