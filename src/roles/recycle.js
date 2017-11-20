module.exports.name = "recycle";
module.exports.run = function(creep) {
    let home_room = creep.find_home_room();

    if(!home_room) {
        return;
    }

    let spawns = home_room.findMyStructures(STRUCTURE_SPAWN);
    if(_.isEmpty(spawns)) {
        return;
    }
    let closest = creep.pos.findClosestByPath(spawns);

    let rc = closest.recycleCreep(creep);
    if(rc == ERR_NOT_IN_RANGE) {
        creep.moveTo(closest);
    } else if(rc == OK) {
        creep.memory.expected_death = Game.time + 1;
    }
};
