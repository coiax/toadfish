var constants = require("constants");
var Subsystem = require("subsystem");

// rice field
var PASTURE_TEXT = "🌾"

class Dairy extends Subsystem {
    constructor(mc) {
        super(mc);

        this.name = "dairy";
        this.mode = constants.PER_OWNED_ROOM;
    }

    run(room) {
        // Produce dedicated harvesting creeps that do nothing but
        // harvest and offload into nearby containers.
        if(!room.memory.dairy)
            room.memory.dairy = {};

        let memory = room.memory.dairy;
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


        for(let i in memory.sources) {
            let item = memory.sources[i];
            let dropoff = RoomPosition.unpack(item.dropoff);

            let has_structure = dropoff.look_for_structure(STRUCTURE_CONTAINER);
            let has_site = dropoff.look_for_site(STRUCTURE_CONTAINER);

            if(!has_structure && !has_site) {
                room.oversee_construction_task(dropoff, STRUCTURE_CONTAINER);
                continue;
            }

            // if the dropoff point is built, cows can start going to
            // the pasture
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

            let visual = new RoomVisual(pos.roomName);
            visual.text(PASTURE_TEXT, pasture);
        };
    }
}

module.exports = Dairy;
