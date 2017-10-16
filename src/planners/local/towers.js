module.exports.run = function(room) {
    // Any towers in the room, find targets.
    var towers = room.find(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_TOWER}
    });
}
