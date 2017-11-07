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
        if(Game.cpu.getUsed() > Game.cpu.limit) {
            throw new constants.SchedulerTimeout();
        }
    }
    run(room) {
        return;
    }
}

module.exports = Subsystem;
