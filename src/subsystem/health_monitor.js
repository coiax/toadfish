var constants = require("constants");
var Subsystem = require("subsystem");

class HealthMonitor extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "health_monitor";
        this.mode = constants.PER_TICK;

        // Should run before the GC
        this.order = constants.HEALTH_MONITOR_ORDER;
    }

    run() {
        let damaged_creeps = [];

        for(let name in Memory.creeps) {
            let creep = Game.creeps[name];
            let memory = Memory.creeps[name];
            if(!creep && memory.expected_death != Game.time) {
                let pos = RoomPosition.unpack(memory.last_position);
                damaged_creeps.push(pos);
            }
        }

        for(let name in Game.creeps) {
            let creep = Game.creeps[name];

            if(creep.memory.last_hits) {
                if(creep.hits < creep.memory.last_hits)
                    damaged_creeps.push(creep);
            }

            creep.memory.last_hits = creep.hits;
            // If a creep is not found before this time, then it must
            // have been killed instantly before reporting any damage
            creep.memory.expected_death = Game.time + creep.ticksToLive;
            creep.memory.last_position = creep.pos.pack();
        }

        for(let item of damaged_creeps) {
            // It's either a Creep or a RoomPosition object.
            let pos = item.pos || item;

            // TODO maybe react later, but for now, let's highlight it.
            pos.highlight({fill: "OrangeRed"});
        }
    }
}

module.exports = HealthMonitor;
