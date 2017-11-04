var constants = require("constants");

function MC() {
    this.subsystems = {};
    this.active_subsystems = {};
    this.nameless_id = 1;
    this.load_all();
}


MC.prototype.load_all = function() {
    this.load_subsystem(require("subsystem_analysis"));
    this.load_subsystem(require("subsystem_extension"));
    this.load_subsystem(require("subsystem_family_planner"));
    this.load_subsystem(require("subsystem_gc"));
    this.load_subsystem(require("subsystem_role_manager"));
    this.load_subsystem(require("subsystem_room_counter"));
    this.load_subsystem(require("subsystem_scout"));
};


MC.prototype.load_subsystem = function(module) {
    if(!module.name) {
        module.name = "nameless_subsystem_" + nameless_id;
        nameless_id++;
    }
    if(!module.order)
        module.order = constants.DEFAULT_SUBSYSTEM_ORDER;

    if(!module.mode) {
        console.log("Module " + module.name + " is missing mode.");
        return;
    }

    this.subsystems[module.name] = module;
    if(module.starts_active)
        this.active_subsystems[module.name] = module;
};


MC.prototype.run_subsystem = function(subsystem) {
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

MC.prototype.run = function() {
    // Find the next SS that is active and has the lowest "order" no.
    while(!_.isEmpty(this.active_subsystems)) {
        var lowest_subsystem = null;

        for(var name in this.active_subsystems) {
            var subsystem = this.active_subsystems[name];
            if(!lowest_subsystem || subsystem.order < lowest_subsystem.order)
                lowest_subsystem = subsystem;
        }

        this.run_subsystem(lowest_subsystem);
        delete this.active_subsystems[lowest_subsystem.name];
    }
};

module.exports = MC;
