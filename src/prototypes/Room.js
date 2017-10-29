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
