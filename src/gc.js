module.exports = {
    gc: function() {
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
};
