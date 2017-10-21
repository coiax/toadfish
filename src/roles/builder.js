module.exports.name = "builder";
module.exports.run = function(creep) {
    // if no energy, get energy.
    var target = Game.getObjectById(creep.memory.target_id);
    // if no target, then the planners messed up.

    var mode = creep.memory.build_mode;
    var rc;
    if(mode == "build") {
        rc = creep.build(target);
    } else if(mode == "repair") {
        rc = creep.repair(target);
    } else {
        console.log(creep.name + " - bad builder mode - " + mode);
        return;
    }

    if(rc == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
};
