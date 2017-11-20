var visualising = require("util_visualising");
var normalised_to_colour = visualising.normalised_to_colour;

Room.prototype.visualise_path = function(path, style) {
    if(_.isString(path))
        path = Room.deserializePath(path);

    if(!style) {
        style = {
            lineStyle: "dashed"
        };
    }

    // [ (x0,y0), (x1,y1) ... (xn-2,yn-2), (xn-1,yn-1) ]
    for(var i = 0; i < path.length - 1; i++) {
        var first = path[i];
        var second = path[i + 1];

        this.visual.line(first.x, first.y, second.x, second.y, style);
    }
};

Room.prototype.all_positions = function() {
    var positions = [];
    for(var i=0; i<50; i++) {
        for(var j=0; j<50; j++) {
            positions.push(this.getPositionAt(i,j));
        }
    }
    return positions;
};

Room.prototype.all_exits = function() {
    var exits = [];
    var all_positions = this.all_positions();
    for(var i in all_positions) {
        var pos = all_positions[i];
        if(!(pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49))
            continue;
        if(pos.is_wall())
            continue;
        exits.push(pos);
    }
    return exits;
};

Room.prototype.visualise_value_array_as_text = function(arr) {

    // given a position array of values, display them on the position
    // they correspond to, not displaying any values of null
    for(var i in arr) {
        var value = arr[i];
        if(value === null)
            continue;
        var pos = RoomPosition.unindex(i, this.name);
        this.visual.text(value, pos, {
            font: 0.5
        });
    }
}

Room.prototype.visualise_value_array_as_greyscale = function(arr) {
    var visual = this.visual;
    // given an array of up to 2500 points, paint squares/circles on the
    // room, varying in colours based on the min and maximum of that array
    var min = Infinity;
    var max = -Infinity;

    for(var i in arr) {
        var value = arr[i];
        if(value !== null) {
            if(value < min)
                min = value;
            if(value > max)
                max = value;
        }
    }

    for(var i in arr) {
        var value = arr[i];
        if(value === null)
            continue;

        var normal = (value - min) / (max - min);
        var pos = RoomPosition.unindex(i, this.name);
        visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1, {
            fill: normalised_to_colour(normal)
        });
    }
}

Room.prototype.count_structures = function(include_construction_sites=true) {
    var structures = this.find(FIND_STRUCTURES);

    if(include_construction_sites)
        structures = structures.concat(this.find(FIND_CONSTRUCTION_SITES));

    var amounts = {};
    for(var i in structures) {
        var str = structures[i];
        if(amounts[str.structureType]) {
            amounts[str.structureType]++;
        } else {
            amounts[str.structureType] = 1;
        }
    }
    return amounts;
};

Room.prototype.allowed_structures = function() {
    var rcl = 0;
    if(this.controller)
        rcl = this.controller.level;

    var amounts = {};
    for(var stype in CONTROLLER_STRUCTURES) {
        var entry = CONTROLLER_STRUCTURES[stype];
        amounts[stype] = entry[rcl] || 0;
    }

    return amounts;
};

Room.prototype.can_build_structures = function() {
    // Can produce negative amounts if a controller has been downgraded
    var allowed_amounts = this.allowed_structures();
    var current_amounts = this.count_structures();

    var remaining_amounts = {};
    for(var stype in allowed_amounts) {
        var allowed = allowed_amounts[stype];
        var current = current_amounts[stype] || 0;
        remaining_amounts[stype] = allowed - current;
    }

    return remaining_amounts;
};

Room.prototype.findStructures = function(stype, opts) {
    if(!opts)
        opts = {};
    if(!opts.filter)
        opts.filter = {}
    opts.filter.structureType = stype;

    return this.find(FIND_STRUCTURES, opts);
}

Room.prototype.findMyStructures = function(stype, opts) {
    if(!opts)
        opts = {};
    if(!opts.filter)
        opts.filter = {};

    opts.filter.structureType = stype;

    return this.find(FIND_MY_STRUCTURES, opts);
}

Room.prototype.find_damaged_structures = function(fortifications=false) {
    // returns a sorted list of damaged structures in the room, sorted
    // by highest damage first
    let structures = this.find(FIND_STRUCTURES, {
        filter: function(str) {
            let stype = str.structureType;
            if(!fortifications) {
                if(stype == STRUCTURE_WALL || stype == STRUCTURE_RAMPART) {
                    return false;
                }
            }

            return str.is_damaged();
        }
    });

    let sorted = _.sortBy(structures, function(str) {
        return str.hitsMax - str.hits;
    });

    sorted.reverse();

    return sorted;
};

Room.prototype.find_structures_missing_energy = function(stypes) {
    if(stypes && !_.isArray(stypes))
        stypes = [stypes];

    return this.find(FIND_MY_STRUCTURES, {
        filter: function(str) {
            if(str.energy === undefined || str.energyCapacity === undefined)
                return false;

            if(str.energy >= str.energyCapacity)
                return false;

            if(stypes) {
                if(!_.includes(stypes, str.structureType))
                    return false;
            }
            return true;
        }});
}

Room.prototype.find_containers_with_energy = function(minimum=0) {
    return this.find(FIND_STRUCTURES, {
        filter: function(struct) {
            if(struct.structureType == STRUCTURE_CONTAINER) {
                if(struct.store[RESOURCE_ENERGY] > 50) {
                    return true;
                }
            }
            return false;
        }
    });
}

Room.prototype.find_loose_energy = function(min_energy) {
    if(!min_energy) {
        min_energy = 0;
    }

    return this.find(FIND_DROPPED_RESOURCES, {
        filter: function(rsc) {
            if(rsc.resourceType == RESOURCE_ENERGY) {
                if(rsc.amount >= min_energy) {
                    return true;
                }
            }
            return false;
        }
    });
}

Room.prototype.find_active_sources = function() {
    return this.find(FIND_SOURCES, {
        filter: function(src) {
            if(src.energy > 0)
                return true;
            return false;
        }
    });
}

Room.prototype.is_my = function() {
    if(this.controller && this.controller.my) {
        return true;
    } else {
        return false;
    }
}

Room.prototype.oversee_construction_task = function(position, stype) {
    // Note that `position` does NOT need to be in the room, this just
    // means the room is overseeing that construction.
    // I suppose multiple rooms could oversee the same construction...
    if(!this.is_my())
        throw new Error("cannot add construction tasks overseen by unowned rooms");

    if(!this.memory.sites)
        this.memory.sites = [];

    // No duplicates per room please
    for(var i in this.memory.sites) {
        var item = this.memory.sites[i];
        var cs_pos = RoomPosition.unpack(item.pos);
        if(cs_pos.isEqualTo(position) && item.stype == stype)
            return;
    }

    this.memory.sites.push({
        pos: position.pack(),
        stype: stype
    })
};

Room.prototype.find_landmark = function() {
    // The landmark is either the controller, or the oldest spawn.
    // It serves as the makeshift "centre" of the room, so generally things
    // will be pointed towards it. It *is* possible for the landmark
    // to change
    if(!this.is_my())
        throw new Error("Landmarks don't exist in rooms we don't own");

    var spawns = this.findMyStructures(STRUCTURE_SPAWN);
    if(_.isEmpty(spawns)) {
        return this.controller;
    } else {
        var sorted = _.sortBy(spawns, function(s) {
            return s.memory.built_on;
        });

        return sorted[0];
    }
}

Room.prototype.find_creeps = function() {
    let creeps = [];
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        let home_room = creep.find_home_room();
        if(!home_room || home_room.name != this.name)
            continue;
        creeps.push(creep);
    }
    return creeps;
}

Room.prototype.find_idle_creeps = function(parts) {
    let idlers = [];
    for(let creep of this.find_creeps()) {
        if(!creep.memory.idle)
            continue;
        if(parts && !creep.has_parts(parts))
            continue;

        idlers.push(creep);
    }
    return idlers;
}

Room.prototype.in_safe_mode = function() {
    if(!this.controller)
        return false;
    return this.controller.safeMode;
}
