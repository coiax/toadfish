module.exports.run = function(room) {
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

    if(rcl >= 1) {
        wanted_children.push({
            body: [WORK, CARRY, MOVE], 
            memory: {
                role: "tutorial_upgrader"
            }
        });

    }

    while(!_.isEmpty(free_spawns) && !_.isEmpty(wanted_children)) {
        var child = wanted_children.shift();
        for(var i in free_spawns) {
            var spawn = free_spawns[i];
            var rc = spawn.spawnCreep(child.body, "C" + Game.time.toString(), {
                memory: child.memory
            });

            if(rc == OK) {
                _.remove(free_spawns, spawn)
                break;
            }
        }
    }
}