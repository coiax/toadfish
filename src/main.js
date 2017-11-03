require("all_prototypes");

var master_controller = require("master_controller");

module.exports.loop = function() {
    // wow, we are doing so much here
    master_controller.run();
}
