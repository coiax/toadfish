var constants = require("constants");
var util_position = require("util_position");

var extension_text = "🏠";
var spawn_text = "🏭";

module.exports.name = "extension";
module.exports.mode = constants.PER_OWNED_ROOM;
module.exports.enabled = true;
module.exports.run = function(room) {
    if(!room.memory.extension)
        room.memory.extension = {};

    var ext = room.memory.extension;

    if(!room.memory.exit_distance || !room.memory.exit_distance.complete)
        return;


    if(!ext.proposed) {
        find_best_place(room);
    }

    visualise_extensions(room, ext.proposed);
}

var visualise_extensions = function(room, proposed) {
    var visual = room.visual;

    for(var i in proposed) {
        var item = proposed[i];

        var pos = RoomPosition.unpack(item.pos);
        var stype = item.structureType;

        if(!pos || !stype)
            continue;

        if(!pos.look_for_structure(stype)) {
            if(stype == STRUCTURE_EXTENSION) {
                visual.text(extension_text, pos);
            } else if(stype == STRUCTURE_SPAWN) {
                visual.text(spawn_text, pos);
            } else if(stype == STRUCTURE_ROAD) {
                visual.circle(pos);
            }
        }
    }
}

var strings_to_stamp = function(arr) {
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

var sixbox = strings_to_stamp([
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

var try_stamp = function(room, stamp, opts) {
    if(!opts)
        opts = {};

    var excluded = [];
    if(opts.excluded)
        excluded = util_position.stringify_list(opts.excluded);

    // Attempt to make a spawn plan for the given room.
    var positions = room.all_positions();
    var possible = [];
    for(var i in positions) {
        var pos = positions[i];

        var proposed = [];

        var good = true;
        for(var key in stamp) {
            var stype = stamp[key];

            var dpos = RoomPosition.unindex(key, pos.roomName);

            var translated = pos.translate(dpos.x, dpos.y);
            if(translated.has_planning_obstruction(stype)) {
                good = false;
                break;
            }
            if(excluded.includes(translated.stringify())) {
                good = false;
                break;
            }

            proposed.push({
                structureType: stype,
                pos: translated
            });
        }

        if(good) {
            possible.push(proposed);
        }
    }

    return possible;
}

var find_best_place = function(room, possible) {
    // possible is a series of viable "stamps" that can be placed in the room
    // we want to find the "best" place to put it.
    // - as far as possible from any exits to the room
    // - not within 3 tiles of any controller, source or mineral

    // first, generate our "exclusion zone" of positions within 3 of
    // any controller, source or mineral
    var exclusion_zone = [];

    var things = [room.controller];
    things = things.concat(room.find(FIND_SOURCES));
    things = things.concat(room.find(FIND_MINERALS));

    for(var i in things) {
        var thing = things[i];
        var zone = thing.pos.get_nearby_positions(3);
        exclusion_zone = exclusion_zone.concat(zone);
    }

    exclusion_zone = _.uniq(exclusion_zone, function(pos) {
        return pos.stringify();
    });

    var possible = try_stamp(room, sixbox, {
        excluded: exclusion_zone
    });

    var values = room.memory.exit_distance.values;

    var best_placement = null;
    var best_score = -Infinity;

    // Now rank the possible places.
    for(var i in possible) {
        var proposed = possible[i];
        var score = 0;
        // calculate score.
        for(var j in proposed) {
            var pos = proposed[j].pos;
            score += values[pos.index()];
        }
        if(score > best_score) {
            best_score = score;
            best_placement = proposed;
        }
    }

    room.memory.extension.proposed = best_placement;
}
