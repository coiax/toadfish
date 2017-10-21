module.exports.name = "cow";
module.exports.run = function(creep) {
    // Assert that we have WORK, CARRY, and MOVE parts.
    var source = Game.getObjectById(creep.memory.source_id);

    // Destination is where we put all the energy.
    var destination = Game.getObjectById(creep.memory.destination_id);

    // The pasture is the RoomPosition that the cow naturally sits on.
    var pasture = RoomPosition.unpack(creep.memory.pasture);

    if(pos != pasture) {
        creep.moveTo(pasture);
    } else if(source.energy > 0) {
        creep.harvest(source);
        creep.transfer(destination, RESOURCE_ENERGY);
    } else if(destination.is_damaged()) {
        creep.repair(destination);
        creep.withdraw(destination, RESOURCE_ENERGY);
    }
}
