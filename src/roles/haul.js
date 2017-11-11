module.exports.name = "haul";
module.exports.run = function(creep) {
    let target = Game.getObjectById(creep.memory.target_id);
    let resource_types = creep.memory.resource_types;
    if(!target || !resource_types) {
        creep.memory.idle = true;
        return;
    }
    
    if(!_.isArray(resource_types)) {
        resource_types = [resource_types];
    }

    let amount = 0;

    for(let i in resource_types) {
        let rt = resource_types[i];
        amount += creep.carry[rt];
    }

    if(amount == 0) {
        creep.memory.idle = true;
        return;
    }

    if(creep.pos.isNearTo(target)) {
        let rc;
        for(let i in resource_types) {
            let rt = resource_types[i];
            rc = creep.transfer(target, rt);
            if(rc != OK) {
                creep.memory.last_rc = rc;
                creep.memory.idle = true;
                return;
            }
        }
    } else {
        creep.moveTo(target);
    }
};
