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
        return prefix + Game.time + this.id_counter++;
    }

    close_job(jid) {
        let job = this.memory[jid];
        if(!job)
            throw new Error("Bad job ID: " + jid);

        delete this.memory[jid];
    }

    add_hauling_job(opts) {
        // possible opts:
        // - origin
        //   OR
        // - origin_id - The origin object's id
        // - origin_ppos - The origin object's packed position
        //
        // - destination
        //   OR
        // - destination_id - The destination object's id
        // - desination_ppos - The destinaton object's packed position
        //
        // - rtype - resource type
        // - amount - amount
        //
        // optional flags
        // - wait_limit (default: 0) - if the job is not possible, wait
        //   this many ticks before declaring the job failed
        // - destination_lookahead (default: true) - abort job if destination
        //   is visible and does not have the capacity,
        
        _.defaults(opts, {
            destination_lookahead: true,
            wait_limit: 0
        });

        if(opts.origin) {
            opts.origin_id = origin.id;
            opts.origin_ppos = origin.pos.pack();
        }

        if(opts.destination) {
            opts.desination_id = desination.id;
            opts.destination_ppos = destination.pos.pack();
        }

        let jid = new_job_id("H");

        this.memory[jid] = opts;
    }

    add_job() {
        // Jobs are:
        // Hauling jobs
        // - transport resource from A to B
        // Working jobs
        // - repair/build/upgrade a room object
        // Harvesting jobs
        // - be a dedicated cow
        // - be a deciated miner
    }
}

class Job {
    constructor(id) {
    }
}

module.exports = JobBoard;
