var constants = require("constants");
var Subsystem = require("subsystem");

class FamilyPlanner extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "family_planner";
        this.mode = constants.PER_OWNED_ROOM;
    }

    run(room) {
        var spawns = room.findMyStructures(STRUCTURE_SPAWN);

        for(var i in spawns) {
            var spawn = spawns[i];
            // Mark spawn age.
            if(!spawn.memory.built_on)
                spawn.memory.built_on = Game.time;
        }

        var free_spawns = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN, spawning: null}
        });

        if(_.isEmpty(free_spawns))
            return;

        // A list of {body: [...], memory: {...}} objects, from
        // highest priority to lowest; potential children will be created in order
        var wanted_children = [];

        // Now determine what kids we want.
        var rcl = room.controller.level;

        if(rcl >= 2) {
            if(room.memory.body_count[RANGED_ATTACK] == 0) {
                wanted_children.push([RANGED_ATTACK, MOVE]);
            }
        }

        if(rcl >= 1) {
            wanted_children.push([WORK,CARRY,MOVE]);
        }

        var num_spawned = 0;

        while(!_.isEmpty(free_spawns) && !_.isEmpty(wanted_children)) {
            var child = wanted_children.shift();
            for(var i in free_spawns) {
                var spawn = free_spawns[i];
                var name = "C" + Game.time + num_spawned;
                var rc = spawn.spawnCreep(child, name, {
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

module.exports = FamilyPlanner;
