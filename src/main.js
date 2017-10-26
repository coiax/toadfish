require("all_prototypes");
var role_manager = require("role_manager");
var master_planner = require("planners_master");
var gc = require("gc");

module.exports.loop = function() {
    gc.gc();

    master_planner.run();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.spawning)
            continue;
        role_manager.run(creep);
        creep.visualise_path();
    }
}
