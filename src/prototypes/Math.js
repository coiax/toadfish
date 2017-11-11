Math.prob = function(percentile) {
    if(Math.random() < (percentile / 100)) {
        return true;
    } else {
        return false;
    }
}

Math.randint = function(a, b) {
    // Return a random integer N such that a <= N <= b.
	let min = Math.ceil(a);
	let max = Math.floor(b);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    // The maximum is inclusive and the minimum is inclusive 
}
