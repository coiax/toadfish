var registered = {};

var register = function(role_module) {
    registered[role_module.name] = role_module;
}

register(require("roles_tutorial_upgrader"));
register(require("roles_cow"));
register(require("roles_builder"));

module.exports.run = function(creep) {
    var module = registered[creep.memory.role];
    if(!((module === null) || (module === undefined)))
        module.run(creep)
}
