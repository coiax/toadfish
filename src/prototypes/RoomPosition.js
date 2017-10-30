RoomPosition.prototype.is_plain = function() {
    return Game.map.getTerrainAt(this) == "plain";
};

RoomPosition.prototype.is_swamp = function() {
    return Game.map.getTerrainAt(this) == "swamp";
};

RoomPosition.prototype.is_wall = function() {
    return Game.map.getTerrainAt(this) == "wall";
};

RoomPosition.prototype.pack = function() {
    return {
        x: this.x,
        y: this.y,
        roomName: this.roomName
    }
};

RoomPosition.unpack = function(packed) {
    return new RoomPosition(packed.x, packed.y, packed.roomName);
};

RoomPosition.prototype.look_for_structure = function(stype) {
    var structures = this.lookFor(LOOK_STRUCTURES);
    for(var i in structures) {
        var struct = structures[i];
        if(struct.structureType == stype)
            return struct;
    }
    return null;
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

    if(this.x <= 0 || this.x >= 49 || this.y <= 0 || this.y >= 49)
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

RoomPosition.get_nearby_positions = function(range) {
    // TODO this function can likely be optimised.
    var nearby = [];
    var all_positions = this.all_positions();
    for(var i in all_positions) {
        var other = all_positions[i];
        if(this.inRangeTo(other, range))
            nearby.push(other);
    }
    return nearby;

};
