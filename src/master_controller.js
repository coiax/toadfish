var constants = require("constants");

var subsystems = {};

var load_subsystem = function(module) {
    if(!module.name) {
        console.log("Module " + module.filename + " is missing name.");
        return;
    }
    if(!module.order)
        module.order = constants.DEFAULT_SUBSYSTEM_ORDER;

    if(!module.mode) {
        console.log("Module " + name + " is missing mode.");
        return;
    }

    if(!module.enabled) {
        module.enabled = false;
    }

    subsystems[module.name] = module;
};

load_subsystem(require("subsystem_analysis"));
load_subsystem(require("subsystem_extension"));
load_subsystem(require("subsystem_family_planner"));
load_subsystem(require("subsystem_gc"));
load_subsystem(require("subsystem_role_manager"));
load_subsystem(require("subsystem_room_counter"));
load_subsystem(require("subsystem_scout"));

var run_subsystem = function(subsystem) {
    if(subsystem.mode == constants.PER_TICK) {
        subsystem.run();
    } else if(subsystem.mode == constants.PER_ROOM
        || subsystem.mode == constants.PER_OWNED_ROOM) {
        //
        for(var name in Game.rooms) {
            var room = Game.rooms[name];
            var owned = room.controller && room.controller.my;
            if(subsystem.mode == constants.PER_OWNED_ROOM && !owned)
                continue;

            subsystem.run(room);
        }
    }
}

module.exports.run = function() {
    // TODO Find the next SS that is active and has the lowest "order" no.
    for(var i in subsystems) {
        var subsystem = subsystems[i];
        if(subsystem.enabled)
            run_subsystem(subsystem); 
    }
};
