var constants = require("constants");

module.exports.name = "analysis";
module.exports.mode = constants.PER_OWNED_ROOM;
module.exports.starts_enabled = true;
module.exports.run = function(room) {
    // Each tick that we own a room, perform expensive analysis,
    // storing the results in memory.

    var budget = 3;

    while(budget > 0) {
        var result = closest_exit_path_distance(room)
        if(result) {
            budget--;
            continue;
        }
        break;
    }

    //room.visualise_value_array_as_text(room.memory.exit_distance.values);
    //room.visualise_value_array_as_greyscale(room.memory.exit_distance);

}

var closest_exit_path_distance = function(room) {
    // TODO this entire process is likely duplicating pathfinding
    // operations that can be easily reused in some sort of single
    // revelation burst?

    // Assuming that no creeps or structures are present, determine the
    // shortest distance to an exit.
    if(!room.memory.exit_distance) {
        room.memory.exit_distance = {
            values: [],
            complete: false
        };
    }

    var exit_distance = room.memory.exit_distance;

    if(!exit_distance.values)
        exit_distance.values = [];

    var values = exit_distance.values;

    if(values.length >= 50*50) {
        exit_distance.complete = true;
        return false;
    }

    var exits = room.all_exits();

    if(_.isEmpty(exits))
        return false;

    // Find next point to calculate.
    var pos = RoomPosition.unindex(values.length, room.name);

    var value = null;
    if(pos.is_wall()) { 
        value = null;
    } else {
        var closest = Infinity;
        for(var i in exits) {
            var exit = exits[i];
            var path = room.findPath(pos, exit, {
                ignoreCreeps: true,
                ignoreDestructibleStructures: true,
                ignoreRoads: true
            });

            if(path.length < closest)
                closest = path.length;
        }
        value = closest;
    }

    values.push(value);
    return true;

}
