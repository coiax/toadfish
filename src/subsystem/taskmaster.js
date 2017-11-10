var constants = require("constants");
var Subsystem = require("subsystem");

class Taskmaster extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "taskmaster";
        this.mode = constants.PER_TICK;
    }

    run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];

            creep.find_home_room(); // marks them as homeless if homeless

            if(creep.memory.homeless)
                this.do_homeless(creep);
            if(creep.memory.idle)
                this.do_idle(creep);
        }
    }

    do_homeless(creep) {
        // This creep is orphaned, because its homeroom has been lost or
        // destroyed.

        // Assign it to the nearest (by line distance) owned room.
        var closest = _.sortBy(Game.rooms, function(room) {
            if(!room.is_my())
                return Infinity;
            return Game.map.getRoomLinearDistance(creep.room.name, room.name);
        });

        if(closest.length) {
            creep.memory.home_room = closest[0].name;
            creep.memory.homeless = undefined;
        } else {
            // Press F to pay respect
            creep.suicide();
        }
    };

    do_idle(creep) {
        if(creep.has_worker_parts()) {
            do_idle_worker(creep);
        }
    };

    do_idle_worker(creep) {
        if(creep.carry[RESOURCE_ENERGY] == 0) {
            creep.memory.role = "refill";
        } else {
            var home_room = creep.get_home_room();

            var work_sites = [home_room.controller];
        }
    }
}

module.exports = Taskmaster;
