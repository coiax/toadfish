RoomPosition.prototype.is_plain = function() {
    return Game.map.getTerrainAt(this) == "plain";
};

RoomPosition.prototype.is_swamp = function() {
    return Game.map.getTerrainAt(this) == "swamp";
};

RoomPosition.prototype.is_wall = function() {
    return Game.map.getTerrainAt(this) == "wall";
};
