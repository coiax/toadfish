module.exports.name = "cow";
module.exports.run = function(creep) {
    if(!creep.has_worker_parts()) {
        creep.memory.idle = true;
        return;
    }
    // Assert that we have WORK, CARRY, and MOVE parts.
    let source = Game.getObjectById(creep.memory.target_id);

    // Destination is where we put all the energy.
    let destination = Game.getObjectById(creep.memory.destination_id);

    // The pasture is the RoomPosition that the cow naturally sits on.
    let pasture = RoomPosition.unpack(creep.memory.pasture);


    if(!creep.memory.time_to_pasture)
        creep.memory.time_to_pasture = 0;

    if(!creep.pos.isEqualTo(pasture)) {
        creep.moveTo(pasture);
        creep.memory.time_to_pasture++;
        // keeping track of time to pasture allows for a replacement to be
        // spawned in time for a seemless transition
    } else {
        // sometimes energy can be dumped on the floor if the container
        // isn't emptied enough
        var dropped = pasture.look_for_energy();
        if(dropped)
            creep.pickup(dropped);

        if(source.energy > 0) {
            creep.harvest(source);
            creep.transfer(destination, RESOURCE_ENERGY);
        } else if(destination.is_damaged()) {
            creep.repair(destination);
            creep.withdraw(destination, RESOURCE_ENERGY);
        }
    }
}
