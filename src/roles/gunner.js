module.exports.name = "gunner";
module.exports.run = function(creep) {
    var target = Game.getObjectById(creep.memory.target_id);

    if(!target || !creep.has_parts(RANGED_ATTACK)) {
        creep.memory.idle = true;
        return;
    }

    var range = creep.pos.getRangeTo(target);

    var rc;
    if(range > 3) {
        creep.moveTo(target);
    } else if(range > 1 && range <= 3) {
        rc = creep.rangedAttack(target);
    } else if(range <= 1) {
        rc = creep.rangedMassAttack();
    }

    creep.memory.last_rc = rc;
}
