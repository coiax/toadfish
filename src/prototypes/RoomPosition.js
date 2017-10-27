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
