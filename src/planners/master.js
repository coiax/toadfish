// Global planners
var room_counter = require("planners_global_room_counter");

// Local planners
var construction = require("planners_local_construction");
var towers = require("planners_local_towers");

// Selected planners to run
var global_planners = [room_counter];
var local_planners = [construction, towers];

module.exports.run = function() {
    for(var i in global_planners)
        global_planners[i].run();

    for(var name in Game.rooms) {
        var room = Game.rooms[name];
        if(room.controller && room.controller.my) {
            for(var j in local_planners)
                local_planners[j].run(room);
        }
    }

};
