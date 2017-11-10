var constants = require("constants");

var id = 0;

class Subsystem {
    constructor(mc) {
        this.mc = mc;
        this.name = "subsystem_" + id++;
        this.mode = constants.PER_TICK;
        this.order = constants.DEFAULT_SUBSYSTEM_ORDER;
        this.starts_active = true;
        this.catch_errors = true;
        this.minimum_bucket = 0;
    }
    scheduler_check() {
        if(Game.cpu.getUsed() > Game.cpu.limit) {
            throw new constants.SchedulerTimeout();
        }
    }
    run(room) {
        return;
    }

    get_room_memory(room) {
        if(!room.memory[this.name])
            room.memory[this.name] = {};
        return room.memory[this.name];
    }
}

module.exports = Subsystem;
