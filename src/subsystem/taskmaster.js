let constants = require("constants");
let Subsystem = require("subsystem");

class Taskmaster extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "taskmaster";
        this.mode = constants.PER_TICK;
    }

    run() {
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];

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
            creep.suicide();
        }
    };

    do_idle(creep) {
        creep.memory.target_id = undefined;

        if(creep.has_worker_parts()) {
            this.do_idle_worker(creep);
        } else if(creep.has_parts(RANGED_ATTACK)) {
            this.do_idle_gunner(creep);
        }

    };

    do_idle_worker(creep) {
        if(!creep.is_full()) {
            creep.memory.role = "refill";
            creep.memory.idle = false;
            return;
        }

        let home_room = creep.find_home_room();
        let selected;

        // highly sophisticated priority algorithm
        let choice = Math.randint(1,3);

        if(choice == 1) {
            selected = home_room.controller;
        } else if(choice == 2) {
            let work_sites = [];
            for(let i in home_room.memory.sites) {
                let item = home_room.memory.sites[i];
                let id = item.id;
                let cs = Game.getObjectById(id);
                if(cs) {
                    work_sites.push(cs);
                }
            }

            let damaged_structures = home_room.find_damaged_structures();

            work_sites = work_sites.concat(damaged_structures);

            selected = creep.pos.findClosestByRange(work_sites);
        } else if(choice == 3) {
            return this.do_idle_hauler(creep);
        }

        creep.memory.role = "worker";
        creep.memory.target_id = selected.id;
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

    do_idle_hauler(creep) {
        // Work out who WANTS THE ENERGY and GIVE IT TO THEM
        // TODO likely people will want other resources in the future
        let home_room = creep.find_home_room();

        if(!creep.is_full()) {
            creep.memory.role = "refill";
            creep.memory.idle = false;
            return;
        }

        let priority = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER];
        let selected;

        for(let i in priority) {
            let stype = priority[i];
            let structs = home_room.find_structures_missing_energy(stype);
            selected = creep.pos.findClosestByRange(structs);
            if(selected)
                break;
        }

        if(selected) {
            creep.memory.role = "haul";
            creep.memory.target_id = selected.id;
            creep.memory.resource_type = RESOURCE_ENERGY;
            creep.memory.idle = false;
        }
    }
}

module.exports = Taskmaster;
