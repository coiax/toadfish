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
    // one that has CARRY, and MOVE parts and no WORK parts.
    return this.has_parts([CARRY, MOVE], [WORK]);
}

Creep.prototype.has_parts = function(whitelist, blacklist) {
    if(!_.isArray(whitelist))
        whitelist = [whitelist];

    if(!_.isArray(blacklist))
        blacklist = [blacklist];

    whitelist = new Set(whitelist);
    blacklist = new Set(blacklist);

    // Returns true if this creep has every part in `whitelist`
    // and none of the parts in `blacklist`
    for(var i in this.body) {
        var item = this.body[i];
        var type = item.type;
        whitelist.delete(type);
        if(blacklist.has(type))
            return false;
    }

    if(whitelist.size == 0) {
        return true;
    } else {
        return false;
    }
}

Creep.prototype.count_part = function(type) {
    // TODO Can be optimised or cached
    let tally = 0;
    for(let i in this.body) {
        let item = this.body[i];
        if(item.type == type)
            tally++;
    }
    return tally;
}

Creep.prototype.count_lowest_parts = function(types) {
    // Given a list of body parts, return the lowest number that the creep has
    // [WORK, MOVE*2, CARRY*3] -> (WORK, MOVE, CARRY) -> 1
    // [TOUGH, MOVE*5, CARRY*3] -> (MOVE, CARRY) -> 3
    let values = [];
    for(let i in types) {
        let type = types[i];
        let count = this.count_part(type);
        values.push(count);
    }
    return _.min(values);
}

Creep.prototype.scatter = function() {
    // Move in a random valid direction
    let directions = _.shuffle([1,2,3,4,5,6,7,8]);
    for(let dir of directions) {
        let new_pos = this.pos.step(dir);
        if(new_pos.is_walkable(false)) {
            this.move(dir);
            return;
        }
    }
}

Creep.prototype.worker_level = function() {
    return this.count_lowest_parts([WORK, CARRY, MOVE]);
};

Creep.prototype.hauler_level = function() {
    // Workers are not haulers.
    if(this.has_worker_parts()) {
        return 0;
    }
    // An ideal hauler has two CARRY per MOVE
    let moves = this.count_part(MOVE);
    let carries = this.count_part(CARRY);

    return Math.min(Math.floor(carries / 2), moves);
};

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
        return null;
    }
    return home_room;
}
