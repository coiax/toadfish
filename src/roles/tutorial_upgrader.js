module.exports.name = "tutorial_upgrader";
module.exports.run = function(creep) {
	if(creep.memory.upgrading && creep.carry.energy == 0) {
		creep.memory.upgrading = false;
	}
	if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
		creep.memory.upgrading = true;
	}

	if(creep.memory.upgrading) {
		if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}
	}
	else {
		var sources = creep.room.find(FIND_SOURCES);
        var closest = creep.pos.findClosestByRange(sources);
		if(creep.harvest(closest) == ERR_NOT_IN_RANGE) {
			creep.moveTo(closest);
		}
	}
}
