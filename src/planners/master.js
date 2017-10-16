// Global planners
var room_counter = require("planners_global_room_counter");

// Local planners
var construction = require("planners_local_construction");
var towers = require("planners_local_towers");

// Selected planners to run
var global_planners = [room_counter];
var local_planners = [construction, towers];

module.exports.run = function() {
    for(var gp in global_planners)
        gp.run();

    for(var room_name in Game.rooms) {
        var room = Game.rooms[name];
        if(room.controller && room.controller.my) {
            for(var lp in local_planners)
                lp.run(room);
        }
    }

};
