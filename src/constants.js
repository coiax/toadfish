// Subsystem modes.
exports.PER_TICK = "PER_TICK";
exports.PER_ROOM = "PER_ROOM";
exports.PER_OWNED_ROOM = "PER_OWNED_ROOM";

// Subsystem order: lower ones run before larger ones.
exports.CONFIG_SUBSYSTEM_ORDER = -200;
exports.GARBARGE_COLLECTOR_ORDER = -100;
exports.BODY_COUNT_SUBSYSTEM_ORDER = -90;
exports.DAIRY_SUBSYSTEM_ORDER = -80;
exports.TASKMASTER_SUBSYSTEM_ORDER = -70;
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

exports.ERRORS_ONE_LINE = "oneline";
exports.ERRORS_TRACE = "trace";
exports.ERRORS_CRASH = "crash";
exports.ERRORS_SILENT = "silent";

exports.PASTURE = "pasture";
