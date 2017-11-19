var constants = require("constants");

var id = 0;

class Subsystem {
    constructor(mc) {
        this.mc = mc;
        this.name = "subsystem_" + id++;
        this.order = constants.DEFAULT_SUBSYSTEM_ORDER;
        this.starts_active = true;
        this.minimum_bucket = 0;
    }
    scheduler_check() {
        if(Game.cpu.getUsed() > Game.cpu.limit) {
            throw new constants.SchedulerTimeout();
        }
    }

    per_tick() {
        return;
    }

    per_room(room) {
        return;
    }

    per_owned_room(room) {
        return;
    }

    per_creep(creep) {

    }

    get_memory(room) {
        if(!room.memory[this.name])
            room.memory[this.name] = {};
        return room.memory[this.name];
    }

    set_memory(room, obj) {
        room.memory[this.name] = obj;
    }
}

module.exports = Subsystem;
