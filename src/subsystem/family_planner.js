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
        let current_level = (highest || 0) + 1;
        let possible_level = Math.min(16, Math.floor(eca / WORKER_COST));

        let level = Math.min(current_level, possible_level);

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
    let level_count = {};

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        let home_room = creep.find_home_room();
        if(home_room.name != room.name)
            continue;
        if(!creep.has_worker_parts())
            continue;
        let level = creep.count_lowest_parts([WORK, CARRY, MOVE]);
        level_count[level] = (level_count[level] || 0) + 1;
    }

    return level_count;
}

function highest_level_with_x(count, x) {
    // for a map of {1: a, 2: b, 3: c ...}, return the highest key that has a
    // minimum value of x
    // TODO feel free to find a better way
    let highest_key = null;
    for(let key in count) {
        let value = count[key];
        if(value >= x && (!highest_key || highest_key < key))
            highest_key = key;
    }
    return Number(highest_key);

}

function worker_body(level) {
    let body = [];
    for(let i=0; i < level; i++) {
        body.push(WORK);
        body.push(CARRY);
        body.push(MOVE);
    }
    return body;
};

module.exports = FamilyPlanner;
