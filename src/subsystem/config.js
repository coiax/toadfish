var constants = require("constants");
var Subsystem = require("subsystem");

class Config extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "config";
        this.order = constants.CONFIG_SUBSYSTEM_ORDER;
    }

    per_tick() {
        if(!Memory.config)
            Memory.config = {};

        _.defaults(Memory.config, {
            errors: constants.ERRORS_TRACE,
            visualise_moveTo: false
        });
    }
}

module.exports = Config;
