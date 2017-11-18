var constants = require("constants");
var Subsystem = require("subsystem");

class Effect extends Subsystem {
    constructor(mc) {
        super(mc);
        this.name = "effect";
    }

    per_tick() {
        if(!Memory.effects) {
            Memory.effects = [];
        }

        var keep_effects = [];

        for(var i in Memory.effects) {
            var effect = Memory.effects[i];

            effect.lifetime -= 1
            if(effect.lifetime <= 0)
                continue;

            var pos = RoomPosition.unpack(effect.packed_pos);
            var visual = new RoomVisual(pos.roomName);

            if(effect.type == constants.EFFECT_CIRCLE) {
                visual.circle(pos, effect);
                effect.radius -= effect.decay || 0;
                if(effect.radius <= 0)
                    continue;
            } else if(effect.type == constants.EFFECT_TEXT) {
                visual.text(effect.text, pos, effect);
            }

            keep_effects.push(effect);
        }

        Memory.effects = keep_effects;
    }
}

module.exports = Effect;
