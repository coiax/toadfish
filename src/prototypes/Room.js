var visualising = require("util_visualising");
var normalised_to_colour = visualising.normalised_to_colour;

Room.prototype.visualise_path = function(path, style) {
    if(_.isString(path))
        path = Room.deserializePath(path);

    if(!style) {
        style = {
            lineStyle: "dashed"
        };
    }

    // [ (x0,y0), (x1,y1) ... (xn-2,yn-2), (xn-1,yn-1) ]
    for(var i = 0; i < path.length - 1; i++) {
        var first = path[i];
        var second = path[i + 1];

        this.visual.line(first.x, first.y, second.x, second.y, style);
    }
};

Room.prototype.all_positions = function() {
    var positions = [];
    for(var i=0; i<50; i++) {
        for(var j=0; j<50; j++) {
            positions.push(this.getPositionAt(i,j));
        }
    }
    return positions;
};

Room.prototype.all_exits = function() {
    var exits = [];
    var all_positions = this.all_positions();
    for(var i in all_positions) {
        var pos = all_positions[i];
        if(!(pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49))
            continue;
        if(pos.is_wall())
            continue;
        exits.push(pos);
    }
    return exits;
};

Room.prototype.visualise_value_array_as_text = function(arr) {

    // given a position array of values, display them on the position
    // they correspond to, not displaying any values of null
    for(var i in arr) {
        var value = arr[i];
        if(value === null)
            continue;
        var pos = RoomPosition.unindex(i, this.name);
        this.visual.text(value, pos, {
            font: 0.5
        });
    }
}

Room.prototype.visualise_value_array_as_greyscale = function(arr) {
    var visual = this.visual;
    // given an array of up to 2500 points, paint squares/circles on the
    // room, varying in colours based on the min and maximum of that array
    var min = Infinity;
    var max = -Infinity;

    for(var i in arr) {
        var value = arr[i];
        if(value !== null) {
            if(value < min)
                min = value;
            if(value > max)
                max = value;
        }
    }

    for(var i in arr) {
        var value = arr[i];
        if(value === null)
            continue;

        var normal = (value - min) / (max - min);
        var pos = RoomPosition.unindex(i, this.name);
        visual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1, {
            fill: normalised_to_colour(normal)
        });
    }
}

Room.prototype.count_structures = function(include_construction_sites=true) {
    var structures = this.find(FIND_STRUCTURES);

    if(include_construction_sites)
        structures = structures.concat(this.find(FIND_CONSTRUCTION_SITES));

    var amounts = {};
    for(var i in structures) {
        var str = structures[i];
        if(amounts[str.structureType]) {
            amounts[str.structureType]++;
        } else {
            amounts[str.structureType] = 1;
        }
    }
    return amounts;
};

Room.prototype.allowed_structures = function() {
    var rcl = 0;
    if(this.controller)
        rcl = this.controller.level;

    var amounts = {};
    for(var stype in CONTROLLER_STRUCTURES) {
        var entry = CONTROLLER_STRUCTURES[stype];
        amounts[stype] = entry[rcl] || 0;
    }

    return amounts;
};

Room.prototype.can_build_structures = function() {
    // Can produce negative amounts if a controller has been downgraded
    var allowed_amounts = this.allowed_structures();
    var current_amounts = this.count_structures();

    var remaining_amounts = {};
    for(var stype in allowed_amounts) {
        var allowed = allowed_amounts[stype];
        var current = current_amounts[stype] || 0;
        remaining_amounts[stype] = allowed - current;
    }

    return remaining_amounts;
};

Room.prototype.findStructures = function(stype, opts) {
    if(!opts)
        opts = {};
    if(!opts.filter)
        opts.filter = {}
    opts.filter.structureType = stype;

    return this.find(FIND_STRUCTURES, opts);
}

Room.prototype.findMyStructures = function(stype, opts) {
    if(!opts)
        opts = {};
    if(!opts.filter)
        opts.filter = {};

    opts.filter.structureType = stype;

    return this.find(FIND_MY_STRUCTURES, opts);
}

