module.exports.run = function(room) {
    if(!(room.controller && room.controller.my))
        return;

    // Any towers in the room, find targets.
    var towers = room.find(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_TOWER}
    });
}
