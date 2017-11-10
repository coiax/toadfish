var constants = require("constants");
var Subsystem = require("subsystem");

var BAD_CONSTRUCTION_RESPONSES = [ERR_INVALID_TARGET,
    ERR_RCL_NOT_ENOUGH, ERR_INVALID_ARGS];

class Site extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "site";
        this.mode = constants.PER_TICK;
        this.order = constants.SITE_SUBSYSTEM_ORDER;
    }

    run() {
        var unowned_sites = _.keys(Game.constructionSites);

        for(var name in Game.rooms) {
            var room = Game.rooms[name];
            if(!room.is_my())
                continue;
            if(!room.memory.sites)
                room.memory.sites = [];

            var room_sites = room.memory.sites;

            var i = room_sites.length;
            // go backwards so we can delete without affecting iteration
            while(i--) {
                var item = room_sites[i];
                var pos = RoomPosition.unpack(item.pos);
                var cs = Game.constructionSites[item.id];
                if(!cs) {
                    item.id = undefined;
                    cs = find_cs(pos, item.stype);
                }
                if(!cs) {
                    var rc = pos.createConstructionSite(item.stype);
                    if(_.includes(BAD_CONSTRUCTION_RESPONSES, rc)) {
                        room_sites.splice(1, i) // drop request, it's bad.
                        console.log("Bad site: " + JSON.stringify(item));
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
        for(var i in unowned_sites) {
            var id = unowned_sites[i];
            var cs = Game.constructionSites[id];
            /*
            cs.pos.highlight({
                radius: 0.5,
                fill: "FireBrick"
            });
            */
            cs.remove();
        }
    }
}

module.exports = Site;

function find_cs(pos, stype) {
    for(var id in Game.constructionSites) {
        var cs = Game.constructionSites[id];
        if(pos.isEqualTo(cs.pos) && stype == cs.structureType)
            return cs;
    }

    return null;
}
