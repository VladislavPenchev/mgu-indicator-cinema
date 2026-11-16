'use strict';
class Controller {
    constructor(play, stop, now) { this.play = play; this.stop = stop; this.now = now || Date.now; this.active = 'off'; this.pendingOff = null; this.last = null; }
    update(value, enabled) {
        if (!enabled || value === null) { this.reset(); return; }
        if (value === 'off') { if (this.pendingOff === null) this.pendingOff = this.now(); return; }
        this.pendingOff = null;
        if (value === this.active) return;
        this.active = value; this.last = value; this.play(value);
    }
    tick() { if (this.pendingOff !== null && this.now() - this.pendingOff >= 220) this.reset(); }
    reset() { this.pendingOff = null; this.active = 'off'; this.stop(); }
}
module.exports = {Controller};
