var constants = require("constants");
var util_position = require("util_position");
var Subsystem = require("subsystem");

var extension_text = "🏠";
var spawn_text = "🏭";

class Extension extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "extension";
        this.mode = constants.PER_OWNED_ROOM;
        this.starts_active = true;
        this.catch_errors = true;
        this.minimum_bucket = 1000;
    }

    run(room) {
        var memory = this.get_room_memory(room);

        if(!room.memory.exit_distance || !room.memory.exit_distance.complete)
            return;

        if(!memory.proposed) {
            this.find_best_place(room);
        } else {
            this.build_proposed_layout(room);
        }
    }

    find_best_place(room) {
        var memory = this.get_room_memory(room);

        if(!memory.final_possible) {

            var possible = this.try_stamp(room, sixbox, {

                excluded: this.generate_exclusion_zone(room)
            });

            memory.final_possible = possible;
        }

        var possible = memory.final_possible;
        var values = room.memory.exit_distance.values;

        var best_placement = null;
        var best_score = -Infinity;

        // we want to find the "best" place to put our stamps
        // - as far as possible from any exits to the room
        for(var i in possible) {
            var pos = RoomPosition.unpack(possible[i]);
            var layout = apply_stamp(pos, sixbox);
            var score = 0;
            // calculate score.
            for(var j in layout) {
                var pos = layout[j].pos;
                score += values[pos.index()];
            }
            if(score > best_score) {
                best_score = score;
                best_placement = layout;
            }
        }

        room.memory.extension.proposed = best_placement;
    }

    build_proposed_layout(room) {
        var memory = this.get_room_memory(room);

        visualise_extensions(room, memory.proposed);

        // Now we know where we want to build.
        // 1) can we construct any more?
        // 2) is there already construction in progress?
        // 3) place a construction site nearest to existing construction
        
        var can_build = room.can_build_structures();
        var selected_type = null;
        if(can_build[STRUCTURE_SPAWN] > 0) {
            selected_type = STRUCTURE_SPAWN;
        } else if(can_build[STRUCTURE_EXTENSION] > 0) {
            selected_type = STRUCTURE_EXTENSION;
        } else if(can_build[STRUCTURE_ROAD] > 0) {
            selected_type = STRUCTURE_ROAD;
        }

        if(!selected_type)
            return;

        // build the potential sites closest to the first constructed spawn,
        // or to the controller if there is no spawn.
        // Call this point the "landmark".
        var landmark = find_landmark(room);
        var closest_unbuilt = null;
        var closest_distance = Infinity;

        for(var i in memory.proposed) {
            var item = memory.proposed[i];
     
            var pos = RoomPosition.unpack(item.pos);
            var stype = item.structureType;
            if(stype != selected_type)
                continue;

            if(pos.look_for_structure(stype))
                continue;

            var distance = pos.getRangeTo(landmark);
            if(distance < closest_distance) {
                closest_distance = distance;
                closest_unbuilt = pos;
                //console.log(pos.stringify() + "," + distance);
            }
        }

        if(closest_unbuilt) {
            closest_unbuilt.highlight({fill: "#00ff00"});

            if(!closest_unbuilt.look_for_site(selected_type))
                room.createConstructionSite(closest_unbuilt, selected_type)
        }
    }

    generate_exclusion_zone(room) {
        var memory = this.get_room_memory(room);
        if(memory.exclusion_zone)
            return;

        // the "exclusion zone" is any position within 3 of
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

        exclusion_zone = util_position.remove_duplicates(exclusion_zone);
        var stringed = util_position.stringify_list(exclusion_zone);

        room.memory.extension.exclusion_zone = stringed;
    }

    try_stamp(room, stamp, opts) {
        var memory = this.get_room_memory(room);

        if(!opts)
            opts = {};

        var excluded = [];
        if(opts.excluded)
            excluded = util_position.stringify_list(opts.excluded);

        // Attempt to make a spawn plan for the given room.
        var positions = room.all_positions();

        if(!memory.last_index)
            memory.last_index = 0;
        if(!memory.possible)
            memory.possible = [];


        for(var i = memory.last_index; i < positions.length; i++) {
            this.scheduler_check();

            memory.last_index = i;

            var pos = positions[i];

            var layout = apply_stamp(pos, stamp);

            if(!layout)
                continue;

            var good = true;
            for(var j in layout) {
                var item = layout[j];
                if(item.pos.has_planning_obstruction(item.structureType)) {
                    good = false;
                    break;
                }
                if(excluded.includes(item.pos.stringify())) {
                    good = false;
                    break;
                }

                // it's good.
            }

            if(good) {
                memory.possible.push(pos);
            }

        }

        return memory.possible;
    }
}

module.exports = Extension;

var find_landmark = function(room) {
    var spawns = room.findMyStructures(STRUCTURE_SPAWN);
    if(_.isEmpty(spawns)) {
        return room.controller;
    } else {
        var earliest_time = Infinity;
        var earliest_spawn = null;

        for(var i in spawns) {
            var spawn = spawns[i];
            var built_on = spawn.memory.built_on;
            if(built_on < earliest_time) {
                earliest_time = built_on;
                earliest_spawn = spawn;
            }
        }
        return earliest_spawn;
    }
    
};

var visualise_extensions = function(room, proposed) {
    var visual = room.visual;

    for(var i in proposed) {
        var item = proposed[i];

        var pos = RoomPosition.unpack(item.pos);
        var stype = item.structureType;

        if(!pos || !stype)
            continue;

        if(!pos.look_for_structure(stype) && !pos.look_for_site(stype)) {
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

function apply_stamp(pos, stamp) {
    var layout = [];

    for(var key in stamp) {
        var stype = stamp[key];

        var dpos = RoomPosition.unindex(key, pos.roomName);

        var translated = pos.translate(dpos.x, dpos.y);
        if(!translated.is_valid())
            return null;
        layout.push({
            structureType: stype,
            pos: translated
        })
    }

    return layout;
};

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

