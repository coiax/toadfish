Creep.prototype.is_full = function() {
    return _.sum(this.carry) == this.carryCapacity;
}

Creep.prototype.is_empty = function() {
    return _.sum(this.carry) == 0;
}

Creep.prototype.visualise_path = function(path) {
    if(!path)
        path = this.memory._move.path;

    return this.room.visualise_path(path);
}

if(!Creep.prototype._moveTo) {
    Creep.prototype._moveTo = Creep.prototype.moveTo;

    Creep.prototype.moveTo = function(first, second, opts) {
        if(_.isObject(first)) {
            opts = _.clone(second);
        }

        opts = opts || {};

        if(Memory.visual_move) {
            opts.visualizePathStyle = {};
        }

        if(_.isObject(first)) {
            second = opts;
        }

        return this._moveTo(first, second, opts);
    }
}

