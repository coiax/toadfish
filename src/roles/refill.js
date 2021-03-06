module.exports.name = "refill";
module.exports.run = function(creep) {
    if(creep.is_full()) {
        creep.memory.idle = true;
        return;
    }

    // we look for energy sources in the creep's "home room".
    // if we can't access it, or it's not ours, then the creep is marked
    // as homeless by `find_home_room`
    var home_room = creep.find_home_room();
    if(!home_room)
        return;

    // If we're not in the room, just go home, and then we'll work it out when
    // we get there.
    if(creep.room.name != home_room.name) {
        creep.moveTo(new RoomPosition(0,0,home_room.name));
        return;
    }

    var target = Game.getObjectById(creep.memory.target_id);
    if(!target) {
        target = find_target(creep);
        if(target) {
            creep.memory.target_id = target.id;
        } else {
            // How are there no valid energy sources?
            // Pretty easy, actually.
            creep.memory.idle = true;
            return;
        }
    }

    // TODO declare creep idle in advance if refilling would leave
    // energy at max capacity

    var rc;
    if(target.structureType) {
        if(target.store[RESOURCE_ENERGY] < 50) {
            creep.memory.target_id = null;
        } else {
            // storage, container
            rc = creep.withdraw(target, RESOURCE_ENERGY);
        }
    } else if(target.amount) {
        // dropped resource
        rc = creep.pickup(target);
    } else if(target.energy) {
        // source
        rc = creep.harvest(target);
    } else {
        creep.memory.target_id = undefined;
    }

    if(rc == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
    if(rc == ERR_NOT_ENOUGH_RESOURCES)
        creep.idle = true;
};

var find_target = function(creep) {

    // Priority of energy sources
    // storage -> container -> pickup loose -> harvest from source
    // TODO have subsystem for assignment/reservation of energy sources
    // so you don't have multiple people picking up from a limited supply
    var room = creep.room;
    var target = null;
    if(room.storage) {
        target = room.storage;
    }
    if(!target) {
        var dropped_energy = room.find_loose_energy(creep.carryCapacity);
        target = creep.pos.findClosestByRange(dropped_energy);
    }
    if(!target) {
        var containers = room.find_containers_with_energy(creep.carryCapacity);
        // null if empty
        target = creep.pos.findClosestByRange(containers);
    }
    if(!target && creep.has_worker_parts()) {
        var active_sources = room.find_active_sources();
        target = creep.pos.findClosestByRange(active_sources);
    }

    return target;

}
