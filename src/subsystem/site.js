var constants = require("constants");
var Subsystem = require("subsystem");

var BAD_CONSTRUCTION_RESPONSES = [ERR_INVALID_TARGET,
    ERR_RCL_NOT_ENOUGH, ERR_INVALID_ARGS];

class Site extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "site";
        this.order = constants.SITE_SUBSYSTEM_ORDER;
    }

    per_tick() {
        let unowned_sites = _.keys(Game.constructionSites);

        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            if(!room.is_my())
                continue;
            if(!room.memory.sites)
                room.memory.sites = [];

            let room_sites = room.memory.sites;

            let i = room_sites.length;
            // go backwards so we can delete without affecting iteration
            while(i--) {
                let item = room_sites[i];
                let pos = RoomPosition.unpack(item.pos);
                let cs = Game.constructionSites[item.id];
                if(!cs) {
                    item.id = undefined;
                    cs = find_cs(pos, item.stype);
                }
                if(!cs) {
                    let rc = pos.createConstructionSite(item.stype);
                    if(_.includes(BAD_CONSTRUCTION_RESPONSES, rc)) {
                        room_sites.splice(i, 1) // drop request, it's bad.
                    }
                }
                if(cs) {
                    item.id = cs.id;
                    _.pull(unowned_sites, cs.id);
                }
            }
        }

        // `unowned_sites` is now a list of all construction sites
        // not "owned/overseen" by any owned rooms.
        for(let i in unowned_sites) {
            let id = unowned_sites[i];
            let cs = Game.constructionSites[id];

            cs.remove();
        }
    }
}

module.exports = Site;

function find_cs(pos, stype) {
    for(let id in Game.constructionSites) {
        let cs = Game.constructionSites[id];
        if(pos.isEqualTo(cs.pos) && stype == cs.structureType)
            return cs;
    }

    return null;
}
