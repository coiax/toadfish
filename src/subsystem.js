var constants = require("constants");

var id = 0;

class Subsystem {
    constructor(mc) {
        this.mc = mc;
        this.name = "subsystem_" + id++;
        this.mode = constants.PER_TICK;
        this.order = constants.DEFAULT_SUBSYSTEM_ORDER;
        this.starts_active = true;
    }
    check() {
        var scheduler_is_upset = false;
        if(scheduler_is_upset)
            throw constants.SCHEDULER_EXCEPTION_STRING;
    }
    run(room) {
        return;
    }
}

module.exports = Subsystem;
