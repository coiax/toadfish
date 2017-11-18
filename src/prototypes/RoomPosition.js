var constants = require("constants");

RoomPosition.prototype.is_plain = function() {
    return Game.map.getTerrainAt(this) == "plain";
};

RoomPosition.prototype.is_swamp = function() {
    return Game.map.getTerrainAt(this) == "swamp";
};

RoomPosition.prototype.is_wall = function() {
    return Game.map.getTerrainAt(this) == "wall";
};

RoomPosition.unpack = function(s) {
    if(!_.isString(s)) {
        throw new Error("Not a string: " + s);
    }
    var parts = s.split(",");
    var x = Number(parts[0]);
    var y = Number(parts[1]);
    var roomName = parts[2];

    return new RoomPosition(x, y, roomName);
};

RoomPosition.prototype.pack = function() {
    return this.stringify();
};

RoomPosition.prototype.stringify = function() {
    return "" + this.x + "," + this.y + "," + this.roomName;
};

RoomPosition.prototype.index = function() {
    return 50*this.y + this.x;
}

RoomPosition.unindex = function(index, roomName="none") {
    var y = Math.floor(index / 50);
    var x = index % 50;

    return new RoomPosition(x, y, roomName);
}

RoomPosition.prototype.look_for_X = function(X, stype) {
    var things = this.lookFor(X);
    for(var i in things) {
        var thing = things[i];
        if(thing.structureType == stype)
            return thing;
    }
    return null;
};

RoomPosition.prototype.look_for_site = function(stype) {
    return this.look_for_X(LOOK_CONSTRUCTION_SITES, stype);
};

RoomPosition.prototype.look_for_structure = function(stype) {
    return this.look_for_X(LOOK_STRUCTURES, stype);
};

RoomPosition.prototype.look_for_creep = function() {
    // I mean, I think there's some tiny case where you can have
    // multiple creeps on a tile, but I don't think it's worth
    // worrying about
    let creeps = this.lookFor(LOOK_CREEPS);
    if(!_.isEmpty(creeps))
        return creeps[0];
    return null;
}

RoomPosition.prototype.look_for_ss = function(stype) {
    // look for site slash structure
    return this.look_for_structure(stype) || this.look_for_site(stype);
}

RoomPosition.prototype.look_for_resource = function(rtype) {
    let resources = this.lookFor(LOOK_RESOURCES);
    for(let rsc of resources) {
        if(rsc.resourceType == rtype)
            return rsc;
    }
    return null;
}

RoomPosition.prototype.look_for_energy = function() {
    return this.look_for_resource(RESOURCE_ENERGY);
}

RoomPosition.prototype.has_planning_obstruction = function(stype) {
    // Is there anything in this position that would prevent us building
    // a structure here at a later date:
    // - natural walls
    // - a transition edge
    // - constructed structures of a different type to `stype`
    // - construction sites of a different type to `stype`
    // - internal planning to place any of the above
    if(this.is_wall())
        return true;

    if(!this.is_non_exit())
        return true;

    var stuff = this.lookFor(LOOK_CONSTRUCTION_SITES);
    stuff.concat(this.lookFor(LOOK_STRUCTURES));

    for(var i in stuff) {
        var site = stuff[i];
        if(site.structureType != stype &&
            _.includes(OBSTACLE_OBJECT_TYPES, site.structureType))
            //
            return true;
    }

    // TODO check for absence of internal planning for this position

    return false;
};

RoomPosition.prototype.translate = function(x, y) {
    return new RoomPosition(this.x + x, this.y + y, this.roomName);
};


RoomPosition.prototype.all_positions = function() {
    // why yes, this looks similar to the Room.all_positions function
    var positions = [];
    for(var i=0; i<50; i++) {
        for(var j=0; j<50; j++) {
            positions.push(new RoomPosition(i, j, this.roomName));
        }
    }
    return positions;
};

RoomPosition.prototype.get_nearby_positions = function(range, origin=true) {
    var nearby = [];

    for(var dx = -range; dx < range + 1; dx++) {
        for(var dy = -range; dy < range + 1; dy++) {
            var x = this.x + dx;
            var y = this.y + dy;

            var pos = new RoomPosition(x, y, this.roomName);
            if(!origin && pos.isEqualTo(this))
                continue;
            if(pos.is_valid())
                nearby.push(pos);
        }
    }

    return nearby;

};

RoomPosition.prototype.get_adjacent = function() {
    return this.get_nearby_positions(1, false);
};

RoomPosition.prototype.get_walkable_adjacent = function() {
    return _.filter(this.get_adjacent(), function(pos) {
        return pos.is_walkable();
    });
};

RoomPosition.prototype.highlight = function(style) {
    var visual = new RoomVisual(this.roomName);
    visual.circle(this, style);
}

RoomPosition.prototype.bam = function(opts) {
    // Make a circle appear at this position, which decreases in size
    // as ticks go by
    if(!Memory.effects)
        Memory.effects = [];

    if(!opts)
        opts = {};

    _.defaults(opts, {
        type: constants.EFFECT_CIRCLE,
        fill: "Red",
        decay: 0.01,
        radius: 0.5,
        created_at: Game.time,
        lifetime: 50,
        packed_pos: this.pack()
    });

    Memory.effects.push(opts);
}

RoomPosition.prototype.notice = function(text, opts) {
    // Make text appear at this position, disappearing after 100 ticks
    if(!Memory.effects)
        Memory.effects = [];

    if(!opts)
        opts = {};

    _.defaults(opts, {
        type: constants.EFFECT_TEXT,
        text: text || "Notice!",
        created_at: Game.time,
        packed_pos: this.pack(),
        lifetime: 50,
    });

    Memory.effects.push(opts);
}

RoomPosition.prototype.text = function(text, style) {
    // Convience function
    let visual = new RoomVisual(this.roomName);
    visual.text(text, this, style);
}

RoomPosition.prototype.is_valid = function() {
    if(this.x < 0 || this.x > 49 || this.y < 0 || this.y > 49)
        return false;
    return true;
}

RoomPosition.prototype.is_non_exit = function() {
    if(this.x <= 0 || this.x >= 49 || this.y <= 0 || this.y >= 49)
        return false;
    return true;
}

RoomPosition.prototype.get_room = function() {
    // stolen from the engine source code
    var room = Game.rooms[this.roomName];
    if(!room) {
        throw new Error(`Could not access room ${this.roomName}`);
    }
    return room;
}

RoomPosition.prototype.is_walkable = function(ignore_creeps=true) {
    if(!this.is_valid())
        return false;

    if(this.is_wall())
        return false;

    for(var str of this.lookFor(LOOK_STRUCTURES)) {
        if(_.includes(OBSTACLE_OBJECT_TYPES, str.structureType))
            return false;
    }

    if(!ignore_creeps) {
        let room = this.get_room();
        let room_in_safe_mode = room.my && room.in_safe_mode();
        for(var creep of this.lookFor(LOOK_CREEPS)) {
            if(creep.my)
                return false;
            // enemy creeps are walkable when room is in safe mode
            // if we own the room
            if(!room_in_safe_mode)
                return false;
        }
    }

    return true;
}

var symbols = {};
symbols[STRUCTURE_CONTAINER] = "📤;";
symbols[STRUCTURE_EXTENSION] = "🏠";
symbols[STRUCTURE_SPAWN] = "🏭";
symbols[constants.PASTURE] = "🌾";

RoomPosition.prototype.symbol = function(stype) {
    // Display a symbol if a site/structure of `stype` is not present
    // Roads are special because I couldn't find a suitable emoji
    let visual = new RoomVisual(this.roomName);
    let symbol = symbols[stype];

    if(stype == constants.PASTURE) {
        let creep = this.look_for_creep();
        if(!creep || creep.memory.role != "cow")
            visual.text(symbol, this);
    } else if(!this.look_for_ss(stype)) {
        if(stype != STRUCTURE_ROAD) {
            visual.text(symbol, this);
        } else {
            visual.circle(this);
        }
    }
};

RoomPosition.prototype.step = function(dir) {
    let offsetsByDirection = {
        [TOP]: [0,-1],
        [TOP_RIGHT]: [1,-1],
        [RIGHT]: [1,0],
        [BOTTOM_RIGHT]: [1,1],
        [BOTTOM]: [0,1],
        [BOTTOM_LEFT]: [-1,1],
        [LEFT]: [-1,0],
        [TOP_LEFT]: [-1,-1]
    };

    let offset = offsetsByDirection[dir];
    if(!offset)
        throw new Error("Bad direction: " + dir);

    let new_x = this.x + offset[0];
    let new_y = this.y + offset[1];

    return new RoomPosition(new_x, new_y, this.roomName);

}
