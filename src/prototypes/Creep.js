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
