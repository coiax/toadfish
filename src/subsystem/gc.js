var constants = require("constants");
var Subsystem = require("subsystem");

class GarbargeCollector extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "garbarge_collector";
        this.mode = constants.PER_TICK;
        this.order = constants.GARBARGE_COLLECTOR_ORDER;
    }

    run() {
        var maintained = [
            {collection: Memory.structures, comparison: Game.structures},
            {collection: Memory.creeps, comparison: Game.creeps},
            {collection: Memory.spawns, comparison: Game.spawns},
            {collection: Memory.flags, comparison: Game.flags}
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
}

module.exports = GarbargeCollector;
