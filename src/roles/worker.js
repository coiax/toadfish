module.exports.name = "worker";
module.exports.run = function(creep) {
    var target = Game.getObjectById(creep.memory.target_id);

    if(!target || creep.carry[RESOURCE_ENERGY] == 0) {
        creep.memory.target_id = undefined;
        creep.memory.idle = true;
        return;
    }

    // TODO declare idle in advance if projected action
    // would use remaining energy

    var rc;
    if(target.progressTotal) {
        rc = creep.build(target);
    } else if(target.hitsMax) {
        rc = creep.repair(target);
    } else if(target.structureType == STRUCTURE_CONTROLLER) {
        rc = creep.upgradeController(target);
    }

    if(rc == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
};
