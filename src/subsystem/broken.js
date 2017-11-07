var constants = require("constants");
var Subsystem = require("subsystem");

class Broken extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "broken";
        this.mode = constants.PER_TICK;
        this.starts_active = false;
    }

    run() {
        throw "This subsystem is for testing broken subsystem error handling.";
    }
}

module.exports = Broken;
