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

RoomPosition.prototype.get_nearby_positions = function(range) {
    var nearby = [];

    for(var dx = -range; dx < range + 1; dx++) {
        for(var dy = -range; dy < range + 1; dy++) {
            var x = this.x + dx;
            var y = this.y + dy;

            var pos = new RoomPosition(x, y, this.roomName);

            if(pos.is_valid())
                nearby.push(pos);
        }
    }

    return nearby;

};

RoomPosition.prototype.highlight = function(style) {
    var visual = new RoomVisual(this.roomName);
    visual.circle(this, style);
}

RoomPosition.prototype.bam = function(color="Red", decay=0.05) {
    // Make a circle appear at this position, which decreases in size
    // as ticks go by
    if(!Memory.effects)
        Memory.effects = [];

    Memory.effects.push({
        type: constants.EFFECT_CIRCLE,
        fill: color,
        decay: decay,
        radius: 0.5,
        created_at: Game.time,
        lifetime: 100,
        packed_pos: this.pack()
    });
}

RoomPosition.prototype.notice = function(text) {
    // Make text appear at this position, disappearing after 100 ticks
    if(!Memory.effects)
        Memory.effects = [];

    Memory.effects.push({
        type: constants.EFFECT_TEXT,
        text: text,
        created_at: Game.time,
        packed_pos: this.pack(),
        lifetime: 100
    });
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
