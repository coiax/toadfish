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
        console.log(err.stack);
    } else if(Memory.config.errors == constants.ERRORS_CRASH) {
        throw err;
    } else { // Memory.config.errors == constants.ERRORS_SILENT
        // pass
    }
}
