var constants = require("constants");
var util = require("util");

function MC() {
    this.subsystems = {};
    this.active_subsystems = {};
    this.nameless_id = 1;
    this.load_all();
}

var subsystems = [
    "subsystem_analysis",
    "subsystem_body_count",
    "subsystem_broken",
    "subsystem_config",
    "subsystem_dairy",
    "subsystem_effect",
    "subsystem_extension",
    "subsystem_family_planner",
    "subsystem_flag",
    "subsystem_gc",
    "subsystem_health_monitor",
    "subsystem_role_manager",
    "subsystem_scout",
    "subsystem_settler",
    "subsystem_site",
    "subsystem_taskmaster"
]


MC.prototype.load_all = function() {
    for(let reqstring of subsystems) {
        try {
            this.load_subsystem(require(reqstring));
        } catch(err) {
            util.handle_error(err);
        }
    }
};


MC.prototype.load_subsystem = function(ss_cls) {
    var subsystem = new ss_cls(this);

    this.subsystems[subsystem.name] = subsystem;
    if(subsystem.starts_active)
        this.active_subsystems[subsystem.name] = subsystem;
};


MC.prototype.run_subsystem = function(subsystem) {
    if(subsystem.minimum_bucket > Game.cpu.bucket)
        return;

    if(subsystem.mode == constants.PER_TICK) {
        subsystem.run();
    } else if(subsystem.mode == constants.PER_ROOM
        || subsystem.mode == constants.PER_OWNED_ROOM) {
        //
        for(var name in Game.rooms) {
            var room = Game.rooms[name];
            if(subsystem.mode == constants.PER_OWNED_ROOM && !room.is_my())
                continue;
            subsystem.run(room);


        }
    }

}

MC.prototype.run = function() {
    // Find the next SS that is active and has the lowest "order" no.
    while(!_.isEmpty(this.active_subsystems)) {
        var subsystem = null;

        for(var name in this.active_subsystems) {
            var ss = this.active_subsystems[name];

            if(!subsystem) {
                subsystem = ss;
            } else if(ss.order < subsystem.order) {
                subsystem = ss;
            }
        }

        if(subsystem === null) {
            console.log("NO SS?");
            break;
        }

        try {
            this.run_subsystem(subsystem);
        } catch(err) {
            util.handle_error(err);
        } finally {
            delete this.active_subsystems[subsystem.name];
        }
    }
};

module.exports = MC;
