let constants = require("constants");
let Subsystem = require("subsystem");

class Taskmaster extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "taskmaster";
        this.order = constants.TASKMASTER_SUBSYSTEM_ORDER;
    }

    per_creep(creep) {
        if(creep.spawning)
            return;

        if(!creep.find_home_room() || creep.memory.homeless)
            this.do_homeless(creep);
        if(creep.memory.idle)
            this.do_idle(creep);
    }

    do_homeless(creep) {
        // This creep is orphaned, because its homeroom has been lost or
        // destroyed.

        // Assign it to the nearest (by line distance) owned room.
        let closest = _.sortBy(Game.rooms, function(room) {
            if(!room.is_my())
                return Infinity;
            return Game.map.getRoomLinearDistance(creep.room.name, room.name);
        });

        if(closest.length) {
            creep.memory.home_room = closest[0].name;
            creep.memory.homeless = undefined;
        } else {
            // Press F to pay respect
            // creep.suicide();
            creep.say("homeless");
        }
    };

    do_idle(creep) {
        if(creep.has_parts(RANGED_ATTACK)) {
            this.do_idle_gunner(creep);
            return;
        }

        creep.memory.target_id = undefined;

        if(creep.is_empty()) {
            creep.memory.role = "refill";
            creep.memory.idle = false;
            return;
        }

        let home_room = creep.find_home_room();

        let jobs = home_room.find_jobs();

        if(!creep.has_worker_parts()) {
            jobs = _.reject(jobs, { role: "worker" } );
        }

        // sort by priority, and then closest jobs with the same priority
        jobs = _.sortByAll(jobs, "priority", function(job) {
            let target = Game.getObjectById(job.target_id);
            if(target) {
                return creep.pos.getRangeTo(target);
            } else {
                return Infinity;
            }
        });

        if(!jobs.length) {
            return;
        }

        let selected = jobs[0];

        for(var key in selected) {
            creep.memory[key] = selected[key];
        }

        creep.memory.idle = false;
    }

    do_idle_gunner(creep) {
        // XXX it seems likely that military tasks will not work
        // in the same way, so this is just a stopgap against
        // scouts killing our construction sites
        let baddies = creep.room.find(FIND_HOSTILE_CREEPS);
        if(baddies.length) {
            let closest = creep.pos.findClosestByRange(baddies);

            creep.memory.role = "gunner";
            creep.memory.target_id = closest.id;
            creep.memory.idle = false;
        } else {
            let home_room = creep.find_home_room();
            creep.moveTo(home_room.controller);
            creep.signController(home_room.controller, "");
            // still idle, ready for action at any time.
        }
    }
}

module.exports = Taskmaster;
