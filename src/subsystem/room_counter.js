var constants = require("constants");

module.name = "room_counter";
module.mode = constants.PER_TICK;
module.enabled = true;

module.exports.run = function() {
    var count = 0;

    for(var name in Game.rooms) {
        var room = Game.rooms[name];
        if(room.controller && room.controller.my)
            count++;
    };

    Memory.owned_rooms = count;
}
