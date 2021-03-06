module.exports.name = "worker";
module.exports.run = function(creep) {
    var target = Game.getObjectById(creep.memory.target_id);

    if(!target || creep.carry[RESOURCE_ENERGY] == 0) {
        creep.memory.idle = true;
        return;
    }

    // TODO declare idle in advance if projected action
    // would use remaining energy

    var rc;
    if(target.structureType == STRUCTURE_CONTROLLER) {
        rc = creep.upgradeController(target);
    } else if(target.progressTotal) {
        rc = creep.build(target);
    } else if(target.is_damaged() && target.hitsMax) {
        rc = creep.repair(target);
    } else {
        creep.memory.idle = true;
        return;
    }

    if(rc == ERR_NOT_IN_RANGE)
        creep.moveTo(target);

    creep.memory.last_rc = rc;
};
