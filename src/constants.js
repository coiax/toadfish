// Subsystem order: lower ones run before larger ones.
exports.CONFIG_SUBSYSTEM_ORDER = -200;
exports.HEALTH_MONITOR_ORDER = -120;
exports.GARBARGE_COLLECTOR_ORDER = -100;
exports.BODY_COUNT_SUBSYSTEM_ORDER = -90;
exports.DAIRY_SUBSYSTEM_ORDER = -80;
exports.TASKMASTER_SUBSYSTEM_ORDER = -70;
exports.SCOUT_SUBSYSTEM_ORDER = -60;
exports.SETTLER_SUBSYSTEM_ORDER = -50;
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

exports.DISABLE_LOOKAHEAD = "disable_lookahead";
