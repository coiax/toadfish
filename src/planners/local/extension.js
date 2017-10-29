module.exports.run = function(room) {
    if(!(room.controller && room.controller.my))
        return;

    var visual = room.visual;

    if(!room.memory.extension)
        room.memory.extension = {};

    var ext = room.memory.extension;

    // This is where we want them to be placed, in order of construction
    // priority.
    if(!ext.extensions)
        ext.extensions = [];
    if(!ext.spawns)
        ext.spawns = [];
    if(!ext.roads)
        ext.roads = [];

    if(_.isEmpty(ext.extensions))
        try_sixbox(room);

    for(var i in ext.extensions) {
        var pos = RoomPosition.unpack(ext.extensions[i]);
        if(!pos.look_for_structure(STRUCTURE_EXTENSION)) {
            var style = {};
            visual.text("🏠", pos, style) // house emoji.
        }
    }

    for(var i in ext.spawns) {
        var pos = RoomPosition.unpack(ext.spawns[i]);
        if(!pos.look_for_structure(STRUCTURE_SPAWN)) {
            var style = {};
            visual.text("🏭", pos, style) // factory emoji.
        }
    }

    for(var i in ext.roads) {
        var pos = RoomPosition.unpack(ext.roads[i]);
        if(!pos.look_for_structure(STRUCTURE_ROAD)) {
            visual.circle(pos);
        }
    }
}

var strings_to_planning_map = function(arr) {
    var map = {};

    for(var y in arr) {
        var str = arr[y];
        for(var x=0; x < str.length; x++) {
            var ch = str[x];
            var value = null;
            switch(ch) {
                case " ":
                    break;
                case "S":
                    value = STRUCTURE_SPAWN;
                    break;
                case "#":
                    value = STRUCTURE_ROAD;
                    break;
                case "o":
                    value = STRUCTURE_EXTENSION;
                    break;
            }
            if(value)
                map[50*y + x] = value;
        }
    }

    return map;
}

var sixbox = strings_to_planning_map([
    "      S      ",
    "    oo#oo    ",
    "   oo# #oo   ",
    "  oo#o o#oo  ",
    " oo#oo oo#oo ",
    " o#oo   oo#o ",
    "S#oo     oo#S",
    " o#oo   oo#o ",
    " oo#oo oo#oo ",
    "  oo#o o#oo  ",
    "   oo# #oo   ",
    "      #      "
]);

var try_sixbox = function(room) {
    // Attempt to make a sixbox spawn plan.
    var positions = room.all_positions();
    for(var i in positions) {
        var pos = positions[i];

        var proposed_extensions = [];
        var proposed_spawns = [];
        var proposed_roads = [];

        var good = true;
        for(var key in sixbox) {
            var stype = sixbox[key];

            var y = Math.floor(key / 50);
            var x = key % 50;

            var translated = pos.translate(x, y);
            if(translated.has_planning_obstruction(stype)) {
                good = false;
                break;
            }

            if(stype == STRUCTURE_EXTENSION) {
                proposed_extensions.push(translated);
            } else if(stype == STRUCTURE_SPAWN) {
                proposed_spawns.push(translated);
            } else if(stype == STRUCTURE_ROAD) {
                proposed_roads.push(translated);
            }
        }

        if(good) {
            var ext = room.memory.extension;

            ext.extensions = proposed_extensions;
            ext.spawns = proposed_spawns;
            ext.roads = proposed_roads;
            return true;
        }
    }

    return false;
}
