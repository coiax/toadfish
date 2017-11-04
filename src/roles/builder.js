module.exports.name = "builder";
module.exports.run = function(creep) {
    // if no energy, get energy.
    var target = Game.getObjectById(creep.memory.target_id);
    // if no target, then the planners messed up.
    if(!target) {
        creep.memory.idle = true;
        return;
    }

    var rc;
    if(target.progressTotal) {
        rc = creep.build(target);
    } else if(target.hitsMax) {
        rc = creep.repair(target);
    } else {
        console.log(creep.name + " - bad builder target - " + target);
        return;
    }

    if(rc == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
};
