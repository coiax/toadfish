var constants = require("constants");
var Subsystem = require("subsystem");

class FlagSubsystem extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "flag";
    }

    per_tick() {
        for(var i in Game.flags) {
            var flag = Game.flags[i];
            if(!flag.memory.created_on)
                flag.memory.created_on = Game.time;
        }
    }
}

module.exports = FlagSubsystem;
