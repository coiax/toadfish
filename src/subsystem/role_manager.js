var constants = require("constants");
var Subsystem = require("subsystem");

var registered = {};

var register = function(role_module) {
    registered[role_module.name] = role_module;
}

register(require("roles_tutorial_upgrader"));
register(require("roles_cow"));
register(require("roles_worker"));
register(require("roles_refill"));

class RoleManager extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "role_manager";
        this.mode = constants.PER_TICK;
        this.order = constants.ROLE_MANAGER_ORDER;
    }

    run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];

            if(creep.spawning)
                continue;

            var module = registered[creep.memory.role];

            if(!((module === null) || (module === undefined))) {
                module.run(creep);
            } else {
                console.log("No such role as: " + creep.memory.role);
            }
        }
    }
}

module.exports = RoleManager;
