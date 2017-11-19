var constants = require("constants");
var Subsystem = require("subsystem");

// rice field

class Dairy extends Subsystem {
    constructor(mc) {
        super(mc);

        this.name = "dairy";
        this.order = constants.DAIRY_SUBSYSTEM_ORDER;
    }

    per_owned_room(room) {
        let memory = this.get_memory(room);

        // Sort them by biggest bodies first.
        let idlers = room.find_idle_creeps([WORK,CARRY,MOVE]);
        idlers = _.sortBy(idlers, function(creep) {
            return creep.worker_level();
        });
        idlers.reverse();

        // Produce dedicated harvesting creeps that do nothing but
        // harvest and offload into nearby containers.
        if(!memory.sources)
            memory.sources = {};

        if(_.isEmpty(memory.sources)) {
            let room_sources = room.find(FIND_SOURCES);
            for(let i in room_sources) {
                let src = room_sources[i];
                let layout = this.determine_source_layout(room, src);

                layout.packed_pos = src.pos.pack();

                memory.sources[src.id] = layout;
            }
        }


        for(let sid in memory.sources) {
            let item = memory.sources[sid];
            let dpos = RoomPosition.unpack(item.dropoff);
            let dropoff = dpos.look_for_structure(STRUCTURE_CONTAINER);

            if(!dpos.look_for_ss(STRUCTURE_CONTAINER)) {
                room.oversee_construction_task(dpos, STRUCTURE_CONTAINER);
                continue;
            }

            if(!dropoff) {
                continue;
            }

            // if the dropoff point is built, cows can start going to
            // the pasture
            let cow = Game.getObjectById(item.cow_id);
            let level = 0;
            if(cow)
                level = cow.worker_level();

            if(_.isEmpty(idlers))
                continue;

            let top_idler = idlers[0];
            if(top_idler.worker_level() > level) {
                idlers.shift();
                // YOU ARE NOW A COW FOREVER
                if(cow)
                    cow.memory.idle = true; // you are released, old cow
                cow = top_idler;
                item.cow_id = cow.id;

                cow.memory.role = "cow";
                cow.memory.target_id = sid;
                let dropoff = dpos.look_for_structure(STRUCTURE_CONTAINER);
                cow.memory.destination_id = dropoff.id;
                cow.memory.pasture = item.pasture; // already packed.
                cow.memory.idle = false;
            }
        }

        this.visualise_source_layout(room);

    }

    determine_source_layout(room, source) {
        // A cow is placed adjacent to a source, and our drop off is
        // put adjacent to the cow. Some codebases just put the container
        // underneath the cow, but putting it closer to the "base" will
        // result in less time travelling, at only a minor complexity increase

        // if source is in the overseeing room, then we want to be close
        // as possible to our "landmark", generally the oldest spawn
        //
        // but if it's in a remote room, then we want to be closest to
        // the exit to our overseeing room
        let landmark;
        if(room.name == source.room.name) {
            landmark = room.find_landmark();
        } else {
            let direction = Game.map.findExit(source.room, room);
            let exits = source.room.find(direction);
            landmark = source.pos.findClosestByPath(exits);
        }

        let w1 = source.pos.get_walkable_adjacent();
        let pasture = landmark.pos.findClosestByPath(w1);

        // okay, we have our pasture, same process for placing the
        // container

        let w2 = pasture.get_walkable_adjacent();
        let dropoff = landmark.pos.findClosestByPath(w2);

        return {
            pasture: pasture.pack(),
            dropoff: dropoff.pack()
        };
    }

    visualise_source_layout(room) {
        let memory = room.memory.dairy;
        for(let i in memory.sources) {
            let item = memory.sources[i];

            let pos = RoomPosition.unpack(item.packed_pos);
            let pasture = RoomPosition.unpack(item.pasture);
            let dropoff = RoomPosition.unpack(item.dropoff);

            dropoff.symbol(STRUCTURE_CONTAINER);
            pasture.symbol(constants.PASTURE);
        };
    }
}

module.exports = Dairy;
