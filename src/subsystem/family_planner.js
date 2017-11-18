var constants = require("constants");
var util = require("util");
var Subsystem = require("subsystem");

var PROGRESSION = 5;
var WORKER_COST = _.sum([BODYPART_COST[MOVE],
    BODYPART_COST[WORK], BODYPART_COST[CARRY]]);
var MAX_WORKER_LEVEL = 16; // as long as creeps have a max of 50 parts

class FamilyPlanner extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "family_planner";

        // Number spawned this tick, used for unique creep names
        this.spawned = 0;
    }

    per_tick() {
        for(let name in Game.spawns) {
            let spawn = Game.spawns[name];

            // Mark spawn age.
            if(!spawn.memory.built_on) {
                spawn.memory.built_on = Game.time;
            }
        }
    }

    per_owned_room(room, memory) {
        // Determine what creeps we'd *like* to spawn
        let bodies = this.wish_list(room);
        // Then spawn any that are possible.
        this.attempt_spawning(room, bodies);
    }

    wish_list(room) {
        let eca = room.energyCapacityAvailable;

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
        // This means if all creeps are wiped out, the room will slowly
        // ramp up to biggest possible creep, rather than expecting
        // huge things from tiny creeps
        let worker_count = util.worker_count(room);

        // A level 5 worker counts as a 1-4 worker
        for(var i in worker_count) {
            let value = worker_count[i];
            for(let j = 0; j < i; j++) {
                worker_count[j] += value;
            }
        }

        let highest_level = 1;

        for(var i in worker_count) {
            if(worker_count[i] >= PROGRESSION) {
                highest_level = i + 1;
            }
        }


        let possible_level = Math.floor(eca / WORKER_COST);

        let level = Math.min(highest_level, possible_level, MAX_WORKER_LEVEL);

        wanted_children.push(util.worker_body(level));

        return wanted_children;
    }

    attempt_spawning(room, bodies) {
        let free_spawns = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN, spawning: null}
        });

        while(!_.isEmpty(free_spawns) && !_.isEmpty(bodies)) {
            let body = bodies.shift();

            for(let spawn of free_spawns) {
                let name = "C" + Game.time + this.spawned;
                let rc = spawn.spawnCreep(body, name, {
                    memory: {
                        home_room: room.name,
                        idle: true
                    }
                });

                if(rc == OK) {
                    _.remove(free_spawns, spawn);
                    this.spawned++;
                    break;
                }
            }
        }
    }
}

module.exports = FamilyPlanner;
