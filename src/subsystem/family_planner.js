var constants = require("constants");
var Subsystem = require("subsystem");

var PROGRESSION = 5;
var WORKER_COST = _.sum([BODYPART_COST[MOVE],
    BODYPART_COST[WORK], BODYPART_COST[CARRY]]);

class FamilyPlanner extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "family_planner";
        this.mode = constants.PER_OWNED_ROOM;
    }

    run(room) {
        let eca = room.energyCapacityAvailable;
        let spawns = room.findMyStructures(STRUCTURE_SPAWN);

        for(let i in spawns) {
            let spawn = spawns[i];
            // Mark spawn age.
            if(!spawn.memory.built_on)
                spawn.memory.built_on = Game.time;
        }

        let free_spawns = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN, spawning: null}
        });

        if(_.isEmpty(free_spawns))
            return;

        // A list of {body: [...], memory: {...}} objects, from
        // highest priority to lowest; potential children will be created in order
        let wanted_children = [];

        // Now determine what kids we want.
        let rcl = room.controller.level;

        if(rcl >= 2) {
            if(!room.memory.body_count[RANGED_ATTACK]) {
                wanted_children.push([RANGED_ATTACK, MOVE]);
            }
        }

        // If we have at least `PROGRESSION` workers of level N,
        // build N+1 workers if possible with our capacity
        let worker_count = count_worker_levels(room);
        // This means if all creeps are wiped out, the room will slowly
        // ramp up to biggest possible creep, rather than expecting
        // huge things from tiny creeps
        let highest = highest_level_with_x(worker_count, PROGRESSION);
        let current_level = highest + 1;
        let possible_level = Math.min(16, Math.floor(eca / WORKER_COST));

        let level = Math.min(current_level, possible_level);

        if(level >= 2 && count_haulers(room) < PROGRESSION) {
            wanted_children.push(hauler_body(level));
        }

        wanted_children.push(worker_body(level));

        let num_spawned = 0;

        while(!_.isEmpty(free_spawns) && !_.isEmpty(wanted_children)) {
            let child = wanted_children.shift();
            for(let i in free_spawns) {
                let spawn = free_spawns[i];
                let name = "C" + Game.time + num_spawned;
                let rc = spawn.spawnCreep(child, name, {
                    memory: {
                        home_room: room.name,
                        idle: true
                    }
                });

                if(rc == OK) {
                    _.remove(free_spawns, spawn)
                    num_spawned++;
                    break;
                }
            }
        }
    }
}

function count_worker_levels(room) {
    // a worker with WORK*1, CARRY*1, MOVE*1 is a level 1 worker
    // which goes up to level 16, a total of 48 parts.
    //
    // We'll define the worker's "level" as the lowest out of the three
    // parts.
    let level_count = _.fill(Array(16), 0)

    for(let creep of room.find_creeps()) {
        if(!creep.has_worker_parts())
            continue;
        let level = creep.count_lowest_parts([WORK, CARRY, MOVE]);

        // A level 3 worker "counts" as a level 1,2,and 3 worker.
        for(let i = 0; i < level; i++) {
            level_count[i]++;
        }
    }

    return level_count;
}

function count_haulers(room) {
    var count = 0;
    for(let creep of room.find_creeps()) {
        if(creep.has_hauler_parts())
            count++;
    }
    return count;
};

function highest_level_with_x(count, x) {
    let i = count.length;
    while(i--) {
        let value = count[i];
        if(value >= x)
            return i + 1;
    }

    return 1;
}

function worker_body(level) {
    let body = [];
    for(let type of [WORK, CARRY, MOVE]) {
        for(let i=0; i < level; i++) {
            body.push(type);
        }
    }

    return body;
};

function hauler_body(level) {
    // A level one hauler is CARRY, CARRY, MOVE
    // Goes up to level 16 for a CARRY*32, MOVE*16
    let body = [];
    for(let i=0; i < level*2; i++) {
        body.push(CARRY);
    }
    for(let i=0; i < level; i++) {
        body.push(MOVE);
    }
    return body;
};

module.exports = FamilyPlanner;
