module.exports.normalised_to_colour = function(normalised) {
    var value = Math.round(normalised*255);
    return "#" + value.toString(16) + value.toString(16) + value.toString(16);
};
