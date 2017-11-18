var constants = require("constants");
var Subsystem = require("subsystem");

class BodyCount extends Subsystem {
    constructor(mc) {
        super(mc);

        this.name = "body_count";
        this.order = constants.BODY_COUNT_SUBSYSTEM_ORDER;
    }

    per_tick() {
        for(let name in Memory.rooms) {
            let memory = Memory.rooms[name];
            memory.body_count = {};
        }
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            let home_room = creep.find_home_room();
            if(!home_room) {
                continue;
            }

            let body_count = home_room.memory.body_count;

            for(let i in creep.body) {
                let item = creep.body[i];
                let type = item.type;
                body_count[type] = (body_count[type] || 0) + 1;
            }

        }
    }
}

module.exports = BodyCount;
