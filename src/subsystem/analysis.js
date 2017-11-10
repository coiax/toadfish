var constants = require("constants");
var Subsystem = require("subsystem");

class Analysis extends Subsystem {
    constructor(mc) {
        super(mc);

        this.name = "analysis";
        this.mode = constants.PER_OWNED_ROOM;
    }

    run(room) {
        // Each tick that we own a room, perform expensive analysis,
        // storing the results in memory.

        var work_done = false;
        while(true) {
            work_done = closest_exit_path_distance(room) || work_done;
            this.scheduler_check();
            if(!work_done)
                break;
        }

        //room.visualise_value_array_as_text(room.memory.exit_distance.values);
        //room.visualise_value_array_as_greyscale(room.memory.exit_distance);
    }
}

module.exports = Analysis;

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
