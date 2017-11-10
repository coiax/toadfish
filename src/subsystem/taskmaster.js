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
        creep.memory.target_id = undefined;

        if(creep.has_worker_parts()) {
            this.do_idle_worker(creep);
        }

        creep.memory.idle = false;
    };

    do_idle_worker(creep) {
        if(!creep.is_full()) {
            creep.memory.role = "refill";
        } else {
            var home_room = creep.find_home_room();

            var work_sites = [home_room.controller];

            for(var i in home_room.memory.sites) {
                var item = home_room.memory.sites[i];
                var id = item.id;
                var cs = Game.getObjectById(id);
                if(cs) {
                    work_sites.push(cs);
                }
            }

            // highly sophisticated priority algorithm
            var selected = _.sample(work_sites);

            creep.memory.role = "worker";
            creep.memory.target_id = selected.id;
        }
    }
}

module.exports = Taskmaster;
