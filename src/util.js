var constants = require("constants");

// Wow, are we just simulating nested python modules
exports.position = require("util_position");
exports.visualising = require("util_visualising");

exports.handle_error = function(err) {
    if(err instanceof constants.SchedulerTimeout) {
        // pass
    } else if(Memory.config.errors == constants.ERRORS_ONE_LINE) {
        var prefix = "[" + subsystem.name + "] ERROR: "
        var suffix = "";
        if(_.isObject(err))
            suffix = err.name + " - " + err.message;
        if(_.isString(err))
            suffix = err;
        console.log(prefix + suffix);
    } else if(Memory.config.errors == constants.ERRORS_TRACE) {
        if(err.stack) {
            console.log(err.stack);
        } else {
            console.log(err);
        }
    } else if(Memory.config.errors == constants.ERRORS_SILENT) {
        // pass
    } else { // Memory.config.errors == constants.ERRORS_CRASH
        if(!Memory.config.errors == constants.ERRORS_CRASH) {
            console.log("Bad `config.errors`: " + Memory.config.errors);
        }

        throw err;
    }
}
exports.worker_body = function(level) {
    if(level < 1 || level > 16) {
        throw new Error("Bad level: " + level);
    }
    let body = [];
    for(let type of [WORK, CARRY, MOVE]) {
        for(let i=0; i < level; i++) {
            body.push(type);
        }
    }

    return body;
};

exports.hauler_body = function(level) {
    if(level < 1 || level > 16) {
        throw new Error("Bad level: " + level);
    }
    // A level one hauler is CARRY, CARRY, MOVE
    // Goes up to level 16 for a CARRY*32, MOVE*16
    let body = [];
    for(let i=0; i < level*2; i++) {
        body.push(CARRY);
    }
    for(let i=0; i < level; i++) {
        body.push(MOVE);
    }
    return body;
};

var X_count = function(room, func) {
    let level_count = _.fill(Array(16), 0)

    for(let creep of room.find_creeps()) {
        let level = func(creep);

        if(level == 0) {
            continue;
        }

        // Our arrays are 0 indexed.
        let index = level - 1;

        level_count[index]++;
    }

    return level_count;
}

exports.worker_count = function(room) {
    return X_count(room, function(creep) {
        return creep.worker_level();
    });
}

exports.hauler_count = function(room) {
    return X_count(room, function(creep) {
        return creep.hauler_level();
    });
}

exports.targets_count = function(creeps) {
    // Given a list of creeps, count their target_id totals
    let targets = {};

    for(let creep of creeps) {
        let tid = creep.memory.target_id;
        if(tid) {
            targets[tid] = (targets[tid] || 0) + 1;
        }
    }

    return targets;
}
