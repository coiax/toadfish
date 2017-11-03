var constants = require("constants");

module.exports.name = "scout";
module.exports.mode = constants.PER_ROOM;
module.exports.enabled = true;
module.exports.run = function(room) {
    // Store information for future consideration about expansion/attack
    room.memory.scout = {};
    var scout = room.memory.scout;

    scout.time = Game.time;

    if(room.controller) {
        scout.controller = {
            pos: room.controller.pos,
            id: room.controller.id,
            level: room.controller.level,
            owner: room.controller.owner
        }
    }

    var sources = room.find(FIND_SOURCES);
    for(var i in sources) {
        if(!scout.sources)
            scout.sources = [];

        var source = sources[i];
        var item = {
            id: source.id,
            pos: source.pos,
            energyCapacity: source.energyCapacity
        };

        scout.sources.push(item);
    };

    var minerals = room.find(FIND_MINERALS);
    for(var i in minerals) {
        var mineral = minerals[i];
        scout.mineral = {
            id: mineral.id,
            pos: mineral.pos,
            density: mineral.density,
            mineralType: mineral.mineralType
        };
    }

}
