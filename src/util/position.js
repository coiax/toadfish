exports.stringify_list = function(arr) {
    var out = [];
    for(var i in arr) {
        var value = arr[i];
        if(_.isString(value)) {
            out.push(value)
        } else {
            out.push(value.stringify());
        }
    }
    return out;
}

exports.remove_duplicates = function(arr) {
    // Given an array of RoomPosition objects, remove all duplicates.
    return _.uniq(arr, function(pos) {
        return pos.stringify();
    });
}
