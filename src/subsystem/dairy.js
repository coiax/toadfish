var constants = require("constants");
var Subsystem = require("subsystem");

class Dairy extends Subsystem {
    constructor(mc) {
        super(mc);

        this.name = "dairy";
        this.mode = constants.PER_OWNED_ROOM;
    }

    run(room) {
        // Produce dedicated harvesting creeps that do nothing but
        // harvest and offload into nearby containers.
    }
}

module.exports = Dairy;
