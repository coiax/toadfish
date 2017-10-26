Room.prototype.visualise_path = function(path) {
    if(_.isString(path))
        path = Room.deserializePath(path);

    var style = {
        lineStyle: "dashed"
    };

    // [ (x0,y0), (x1,y1) ... (xn-2,yn-2), (xn-1,yn-1) ]
    for(var i = 0; i < path.length - 1; i++) {
        var first = path[i];
        var second = path[i + 1];

        this.visual.line(first.x, first.y, second.x, second.y, style);
    }

}
