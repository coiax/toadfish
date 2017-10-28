module.exports.run = function(room) {
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

    for(var i in ext.extensions) {
        var pos = RoomPosition.unpack(ext.extensions[i]);
        var struct = pos.look_for_structure(STRUCTURE_EXTENSION);
        if(!struct) {
            var style = {};
            visual.text("🏠", pos, style) // house emoji.
        }
    }

    for(var i in ext.spawns) {
        var pos = RoomPosition.unpack(ext.extensions[i]);
        var struct = pos.look_for_structure(STRUCTURE_SPAWN);
        if(!struct) {
            var style = {};
            visual.text("🏭", pos, style) // factory emoji.
        }
    }

    if(ext.path) {
        var style = {
            lineStyle: "dotted"
        };

        room.visualise_path(ext.path, style);
    }


}
