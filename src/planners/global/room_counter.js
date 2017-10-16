module.exports.run = function() {
    var count = 0;

    // An example global planner where we count the number of rooms we own
    for(var name in Game.rooms) {
        var room = Game.rooms[name];
        if(room.controller && room.controller.my)
            count++;
    };

    Memory.owned_rooms = count;
}
