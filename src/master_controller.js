var constants = require("constants");
var util = require("util");

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

class MC {
    constructor() {
        this.subsystems = {};
        this.active_subsystems = {};
        this.nameless_id = 1;
        this.load_all();
    }

    load_all() {
        for(let reqstring of subsystems) {
            try {
                this.load_subsystem(require(reqstring));
            } catch(err) {
                util.handle_error(err);
            }
        }
    }

    load_subsystem(ss_cls) {
        var subsystem = new ss_cls(this);

        this.subsystems[subsystem.name] = subsystem;
        if(subsystem.starts_active) {
            this.active_subsystems[subsystem.name] = subsystem;
        }
    }

    run_subsystem(subsystem) {
        if(subsystem.minimum_bucket > Game.cpu.bucket)
            return;

        subsystem.per_tick();

        for(let name in Game.rooms) {
            let room = Game.rooms[name];

            subsystem.per_room(room);

            if(room.is_my()) {
                subsystem.per_owned_room(room);
            }
        }

        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            subsystem.per_creep(creep);
        }
    }

    run() {
        // Find the next SS that is active and has the lowest "order" no.
        while(!_.isEmpty(this.active_subsystems)) {
            let subsystem = null;

            for(let name in this.active_subsystems) {
                let ss = this.active_subsystems[name];

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
    }
};

module.exports = MC;
