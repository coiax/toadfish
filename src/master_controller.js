var constants = require("constants");

function MC() {
    this.subsystems = {};
    this.active_subsystems = {};
    this.nameless_id = 1;
    this.load_all();
}


MC.prototype.load_all = function() {
    this.load_subsystem(require("subsystem_analysis"));
    this.load_subsystem(require("subsystem_broken"));
    this.load_subsystem(require("subsystem_extension"));
    this.load_subsystem(require("subsystem_family_planner"));
    this.load_subsystem(require("subsystem_gc"));
    this.load_subsystem(require("subsystem_role_manager"));
    this.load_subsystem(require("subsystem_scout"));
};


MC.prototype.load_subsystem = function(ss_cls) {
    var subsystem = new ss_cls(this);

    this.subsystems[subsystem.name] = subsystem;
    if(subsystem.starts_active)
        this.active_subsystems[subsystem.name] = subsystem;
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

        try {
            this.run_subsystem(lowest_subsystem);
        } catch(err) {
            if(err instanceof constants.SchedulerTimeout) {
                return;
            } else {
                var prefix = "[" + lowest_subsystem.name + "] ERROR: "
                var suffix = "";
                if(_.isObject(err))
                    suffix = err.name + " - " + err.message;
                if(_.isString(err))
                    suffix = err;
                console.log(prefix + suffix);
            }
        }

        delete this.active_subsystems[lowest_subsystem.name];
    }
};

module.exports = MC;
