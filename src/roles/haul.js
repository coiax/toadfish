// This haul role is deliberately simple, a more complex hauler
// can be written if we need more fine control of what is delivered
// where.

module.exports.name = "haul";
module.exports.run = function(creep) {
    let target = Game.getObjectById(creep.memory.target_id);
    let resource_type = creep.memory.resource_type;
    if(!target || !resource_type || !creep.carry[resource_type]) {
        creep.memory.idle = true;
        return;
    }

    if(creep.pos.isNearTo(target)) {
        creep.transfer(target, resource_type);
        creep.memory.idle = true;
    } else {
        creep.moveTo(target);
    }
};
