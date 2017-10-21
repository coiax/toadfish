Structure.prototype.is_damaged = function() {
    if(this.hitsMax > this.hits) {
        return true;
    } else {
        return false
    }
}
