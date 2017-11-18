var constants = require("constants");
var util = require("util");
var Subsystem = require("subsystem");

var registered = {};

var register = function(role_module) {
    registered[role_module.name] = role_module;
}

register(require("roles_cow"));
register(require("roles_gunner"));
register(require("roles_haul"));
register(require("roles_refill"));
register(require("roles_tutorial_upgrader"));
register(require("roles_worker"));

class RoleManager extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "role_manager";
        this.order = constants.ROLE_MANAGER_ORDER;
    }

    per_creep(creep) {
        if(creep.spawning) {
            return;
        }

        if(!creep.memory.role) {
            creep.memory.idle = true;
            return;
        }


        var module = registered[creep.memory.role];

        if(!((module === null) || (module === undefined))) {
            try {
                module.run(creep);
            } catch(err) {
                util.handle_error(err);
            }
        } else {
            console.log("No such role as: " + creep.memory.role);
        }
    }
}

module.exports = RoleManager;
