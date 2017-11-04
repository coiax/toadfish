var C = require("constants");

module.exports.name = "garbarge_collector";
module.exports.mode = C.PER_TICK;
module.exports.order = C.GARBARGE_COLLECTOR_ORDER;
module.exports.starts_active = true;

module.exports.run = function() {
    var maintained = [
        {collection: Memory.structures, comparison: Game.structures},
        {collection: Memory.creeps, comparison: Game.creeps},
        {collection: Memory.spawns, comparison: Game.spawns}
    ];

    maintained.forEach(function(obj) {
        var collection = obj.collection;
        var comparison = obj.comparison;
        if(!collection || !comparison)
            return;
        for(var id in collection) {
            if(!comparison[id] || !collection[id] ||
                _.isEmpty(collection[id])) {
                //
                delete collection[id];
            }
        }
    });
}
