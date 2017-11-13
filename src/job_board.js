var constants = require("constants");

class JobBoard {
    constructor(room) {
        this.room = room;

        if(!this.room.memory.job_board)
            this.room.memory.job_board = {};

        this.memory = this.room.memory.job_board;
    }
}

module.exports = JobBoard;
