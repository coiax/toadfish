var constants = require("constants");
var Subsystem = require("subsystem");

class Settler extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "settler";
        // settler should run AFTER the scout ss
        this.order = constants.SETTLER_SUBSYSTEM_ORDER;
    }

    per_tick() {
    }

    assess(roomName) {
        let memory = Memory.rooms[roomName];
        let scout = memory.scout;

        if(!scout.controller)
            return null;

        // First up, let's score basic easy to observe things.
        let score = 0;
        if(scout.mineral) {
            switch(scout.mineral.mineralType) {
                case RESOURCE_UTRIUM:
                case RESOURCE_LEMERGIUM:
                case RESOURCE_KEANIUM:
                case RESOURCE_ZYNTHIUM:
                case RESOURCE_CATALYST:
                    score++;
                    break;
            }
        }

        let sources = scout.sources.length;
        if(sources == 0) {
            return null;
        } else if(sources == 1) {
            score -= 2;
        } else if(sources > 2) {
            // not sure if a settlable room with 2+ sources exists
            score += 1;
        }

        // Factors to include:
        // - Number of mining slots on the sources, important for early
        // - Path distance from sources to controller
        // - Whether controller, sources and minerals can be fortified
        //   in a single compound.


    }
}

module.exports = Settler;
