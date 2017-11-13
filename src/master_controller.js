var constants = require("constants");

function MC() {
    this.subsystems = {};
    this.active_subsystems = {};
    this.nameless_id = 1;
    this.load_all();
}


MC.prototype.load_all = function() {
    this.load_subsystem(require("subsystem_analysis"));
    this.load_subsystem(require("subsystem_body_count"));
    this.load_subsystem(require("subsystem_broken"));
    this.load_subsystem(require("subsystem_config"));
    this.load_subsystem(require("subsystem_dairy"));
    this.load_subsystem(require("subsystem_effect"));
    this.load_subsystem(require("subsystem_extension"));
    this.load_subsystem(require("subsystem_family_planner"));
    this.load_subsystem(require("subsystem_flag"));
    this.load_subsystem(require("subsystem_gc"));
    this.load_subsystem(require("subsystem_health_monitor"));
    this.load_subsystem(require("subsystem_role_manager"));
    this.load_subsystem(require("subsystem_scout"));
    this.load_subsystem(require("subsystem_settler"));
    this.load_subsystem(require("subsystem_site"));
    this.load_subsystem(require("subsystem_taskmaster"));
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
            if(err instanceof constants.SchedulerTimeout) {
                // pass
            } else if(Memory.config.errors == constants.ERRORS_ONE_LINE) {
                var prefix = "[" + subsystem.name + "] ERROR: "
                var suffix = "";
                if(_.isObject(err))
                    suffix = err.name + " - " + err.message;
                if(_.isString(err))
                    suffix = err;
                console.log(prefix + suffix);
            } else if(Memory.config.errors == constants.ERRORS_TRACE) {
                console.log(err.stack);
            } else if(Memory.config.errors == constants.ERRORS_CRASH) {
                throw err;
            } else { // Memory.config.errors == constants.ERRORS_SILENT
            }
        } finally {
            delete this.active_subsystems[subsystem.name];
        }
    }
};

module.exports = MC;
