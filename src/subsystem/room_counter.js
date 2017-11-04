var constants = require("constants");

module.exports.name = "room_counter";
module.exports.mode = constants.PER_TICK;
module.exports.starts_enabled = true;

module.exports.run = function() {
    var count = 0;

    for(var name in Game.rooms) {
        var room = Game.rooms[name];
        if(room.controller && room.controller.my)
            count++;
    };

    Memory.owned_rooms = count;
}
