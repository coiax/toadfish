require("all_prototypes");
var role_manager = require("role_manager");
var gc = require("gc");

module.exports.loop = function() {
    gc.gc();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.spawning)
            continue;
        role_manager.run(creep);
    }
}
