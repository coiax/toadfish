var C = require("constants");

var registered = {};

var register = function(role_module) {
    registered[role_module.name] = role_module;
}

register(require("roles_tutorial_upgrader"));
register(require("roles_cow"));
register(require("roles_builder"));

module.exports.name = "role_manager";
module.exports.mode = C.PER_TICK;
module.exports.order = C.ROLE_MANAGER_ORDER;
module.exports.enabled = true;

module.exports.run = function(creep) {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.spawning)
            continue;

        var module = registered[creep.memory.role];

        if(!((module === null) || (module === undefined)))
            module.run(creep);

        creep.visualise_path();
    }
}
