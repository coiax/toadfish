var constants = require("constants");

class JobBoard {
    constructor(room) {
        this.room = room;

        if(!this.room.memory.job_board)
            this.room.memory.job_board = {};

        this.memory = this.room.memory.job_board;

        this.id_counter = 0;
    }

    new_job_id(prefix) {
        if(!prefix) {
            prefix = "";
        }
        return prefix + Game.time + this.id_counter++;
    }

    close_job(jid) {
        let job = this.memory[jid];
        if(!job)
            throw new Error(`Bad job ID: ${jid}`);

        delete this.memory[jid];
    }

    // Worker Jobs:
    // - upgrade controller
    // - repair structures
    // - build construction sites

}

class Job {
    constructor(obj) {
        this.priority = 0;

        if(obj) {
            Object.assign(this, obj);
        }
    }
}

module.exports = JobBoard;
