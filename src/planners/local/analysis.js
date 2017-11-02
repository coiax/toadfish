module.exports.name = "analysis";
module.exports.run = function(room) {
    if(!room.controller || !room.controller.my)
        return;

    // Each tick that we own a room, perform expensive analysis,
    // storing the results in memory.

    var budget = 1;

    while(budget >= 0) {
        var result = closest_exit_path_distance(room)
        if(result) {
            budget--;
            continue;
        }
        break;
    }

    //room.display_value_array(room.memory.exit_distance);
    room.visualise_value_array(room.memory.exit_distance);

}

var closest_exit_path_distance = function(room) {
    // Assuming that no creeps or structures are present, determine the
    // shortest distance to an exit.
    if(!room.memory.exit_distance)
        room.memory.exit_distance = [];

    var exit_distance = room.memory.exit_distance;
    if(exit_distance.length >= 50*50)
        return false;

    var exits = room.all_exits();

    if(_.isEmpty(exits))
        return false;

    // Find next point to calculate.
    var pos = RoomPosition.unindex(exit_distance.length, room.name);

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

    exit_distance.push(value);
    return true;

}
