var C = require("constants");

var registered = {};

var register = function(role_module) {
    registered[role_module.name] = role_module;
}

register(require("roles_tutorial_upgrader"));
register(require("roles_cow"));
register(require("roles_worker"));
register(require("roles_refill"));

module.exports.name = "role_manager";
module.exports.mode = C.PER_TICK;
module.exports.order = C.ROLE_MANAGER_ORDER;
module.exports.starts_enabled = true;

module.exports.run = function(creep) {
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

        creep.visualise_path();
    }
}
