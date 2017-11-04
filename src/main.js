require("all_prototypes");

var MC = require("master_controller");

module.exports.loop = function() {
    // wow, we are doing so much here
    var mc = new MC();
    mc.run();
}
