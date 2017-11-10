Creep.prototype.is_full = function() {
    return _.sum(this.carry) == this.carryCapacity;
}

Creep.prototype.is_empty = function() {
    return _.sum(this.carry) == 0;
}

Creep.prototype.has_worker_parts = function() {
    // a WORKER creep is defined as one that has WORK, CARRY, MOVE parts
    return this.has_parts([WORK, CARRY, MOVE]);
}

Creep.prototype.has_hauler_parts = function() {
    // one that has CARRY, and MOVE parts.
    return this.has_parts([CARRY, MOVE]);
}

Creep.prototype.has_parts = function(parts) {
    if(!_.isArray(parts))
        parts = [parts];

    // Returns true if this creep has every part in `parts`
    var has_parts = [];
    for(var i in this.body) {
        var item = this.body[i];
        var type = item.type;
        if(!_.includes(has_parts, type))
            has_parts.push(type);
    }

    var diff = _.difference(parts, has_parts);
    if(diff.length) {
        return false;
    } else {
        return true;
    }
}

if(!Creep.prototype._moveTo) {
    Creep.prototype._moveTo = Creep.prototype.moveTo;

    Creep.prototype.moveTo = function(first, second, opts) {
        if(_.isObject(first)) {
            opts = _.clone(second);
        }

        opts = opts || {};

        if(Memory.config.visualise_moveTo) {
            _.defaults(opts, {
                visualizePathStyle: {}
            });
        }

        _.defaults(opts, {
            // This stops creeps moving in lockstep.
            reusePath: _.sample([4,5,6])
        });

        if(_.isObject(first)) {
            second = opts;
        }

        return this._moveTo(first, second, opts);
    }
}

Creep.prototype.find_home_room = function() {
    var home_room = Game.rooms[this.memory.home_room];
    if(!home_room || !home_room.is_my()) {
        this.memory.homeless = true;
        return null;
    }
    return home_room;
}
