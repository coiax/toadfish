var util = require("util");
var constants = require("constants");

var job_priority = {
    IDLE_CONTROLLER: 1,
    SPAWNING_INFRASTRUCTURE: 2,
    TOWER_REFILL: 3,
    DAMAGED_BUILDINGS: 4,
    CONSTRUCTION: 5,
    NON_IDLE_CONTROLLER: 100
};

Room.prototype.find_jobs = function() {
    let jobs = [];
    let creeps = this.find_creeps();

    if(_.isEmpty(creeps)) {
        return [];
    }

    // Controller

    let target_count = util.targets_count(creeps);

    let upgraders = target_count[this.controller.id];
    let controller_priority;
    if(!upgraders) {
        controller_priority = job_priority.IDLE_CONTROLLER;
    } else {
        controller_priority = job_priority.NON_IDLE_CONTROLLER;
    }

    jobs.push({
        role: "worker",
        target_id: this.controller.id,
        priority: controller_priority
    });

    // Creep spawning infrastructure and towers

    for(let struct of this.find_structures_missing_energy(
        [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER])) {
        //
        let priority = job_priority.SPAWNING_INFRASTRUCTURE;
        if(struct.structureType == STRUCTURE_TOWER) {
            priority = job_priority.TOWER_REFILL;
        }

        jobs.push({
            role: "haul",
            target_id: struct.id,
            resource_type: RESOURCE_ENERGY,
            priority: priority
        });
    }

    for(let struct of this.find_damaged_structures()) {
        jobs.push({
            role: "worker",
            target_id: struct.id,
            priority: job_priority.DAMAGED_BUILDINGS
        });
    }

    for(let item of this.memory.sites) {
        let cs = Game.getObjectById(item.id);
        if(!cs) {
            continue;
        }

        jobs.push({
            role: "worker",
            target_id: cs.id,
            priority: CONSTRUCTION
        });
    }
    

    return jobs;
};


