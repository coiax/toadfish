module.exports.run = function(room) {
    if(!room.memory.ant_trail) {
        room.memory.ant_trail = {
            time: Game.time,
            strengths: Array(50 * 50).fill(0)
        };
    }

    var ant_trail = room.memory.ant_trail;

    // last time it was updated, this means we can remove trails for old rooms.
    ant_trail.time = Game.time;

    var creeps = room.find(FIND_MY_CREEPS);
    for(var i in creeps) {
        var creep = creeps[i];
        var index = (creep.pos.x * 50) + creep.pos.y;

        // make the trail stronger.
        ant_trail.strengths[index] += 100;
    }

    // and wash away.
    for(var i in ant_trail.strengths) {
        ant_trail.strengths[i] -= 1;
        if(ant_trail.strengths[i] < 0)
            ant_trail.strengths[i] = 0
    }

    // visualise.
    var max_value = _.max(ant_trail.strengths);
    for(var x = 0; x < 50; x++) {
        for(var y = 0; y < 50; y++) {
            var strength = ant_trail.strengths[x*50 + y];
            var style = {
                font: 0.5,
                opacity: 0.8
            };
            room.visual.text(strength, x, y, style);
        }
    }
};
