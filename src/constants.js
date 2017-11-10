// Subsystem modes.
exports.PER_TICK = "PER_TICK";
exports.PER_ROOM = "PER_ROOM";
exports.PER_OWNED_ROOM = "PER_OWNED_ROOM";

// Subsystem order: lower ones run before larger ones.
exports.GARBARGE_COLLECTOR_ORDER = -100;
exports.DEFAULT_SUBSYSTEM_ORDER = 0;
exports.SITE_SUBSYSTEM_ORDER = 90;
exports.ROLE_MANAGER_ORDER = 100;


class SchedulerTimeout extends Error {
    constructor(message) {
        super(message);
        this.name = "SchedulerTimeout";
    }
}

exports.SchedulerTimeout = SchedulerTimeout;

exports.EFFECT_CIRCLE = "circle";
exports.EFFECT_TEXT = "text";
