var constants = require("constants");
var Subsystem = require("subsystem");

class Flag extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "flag";
        this.mode = constants.PER_TICK;
    }

    run() {
        for(var i in Game.flags) {
            var flag = Game.flags[i];
            if(!flag.memory.created_on)
                flag.memory.created_on = Game.time;
        }
    }
}

module.exports = Flag;
