require("prototypes_RoomPosition");
var task_tutorial_upgrader = require("task_tutorial_upgrader");
var gc = require("gc");

module.exports.loop = function() {
    gc.gc();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.spawning)
            continue;
        var selected_module;
        switch(creep.memory.task) {
            case "tutorial_upgrader":
                selected_module = task_tutorial_upgrader;
                break;
        }
        if(selected_module !== null)
            selected_module.run(creep);
    }
}
