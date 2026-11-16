'use strict';
const zlib = require('zlib');
const {composite} = require('./composite');
const {ClusterRender} = require('./cluster_render_client');
const W = 384, H = 216, FPS = 12, BYTES = W * H * 3 / 2;
const clips = {};
function load(name) {
    if (!clips[name]) {
        const raw = zlib.gunzipSync(Buffer.from(require('./clip-' + name).data, 'base64'));
        if (!raw.length || raw.length % BYTES) throw Error('Invalid frame atlas: ' + name);
        clips[name] = raw;
    }
    return clips[name];
}
class Player {
    constructor(log, options, client) {
        this.log = log; this.options = options; this.refs = []; this.status = 'Waiting for renderer'; this.id = 0;
        this.cr = client || new ClusterRender('vgp_indicator_cinema');
        this.cr.on('ready', () => { this.status = 'Renderer connected'; });
        this.cr.on('disconnected', () => { this.stop(); this.status = 'Renderer disconnected'; });
        this.cr.on('refused', (op, ref, reason) => { this.status = 'Renderer refused: ' + reason; this.stop(); });
        this.cr.on('target', (name, state, holder, reason) => { this.status = name + ': ' + state + (reason ? ' ' + reason : ''); });
        this.cr.on('layer', (ref, state, reason) => { if (state === 'error') this.status = 'Renderer: ' + reason; });
        this.cr.connect();
    }
    play(name, done) {
        this.clearTimer(); const opt = this.options();
        if (!opt[name]) { this.status = name + ' disabled'; return false; }
        if (!this.cr.ready) { this.status = 'Cluster renderer not connected'; return false; }
        let raw; try { raw = load(name); } catch (e) { this.status = e.message; return false; }
        if (!this.leftPose) this.leftPose=load('left').slice(0,BYTES);
        if (!this.rightPose) this.rightPose=load('left').slice(0,BYTES);
        const destinations = opt.target === 'both' ? ['map','hud'] : [opt.target];
        if (!this.refs.length) destinations.forEach((target) => {
            // Small independent layer, never whole-cluster panel. HUD yields to stock lists.
            const hud = target === 'hud';
            this.refs.push(this.cr.video({target, klass:'overlay', z:50, x:hud?144:160, y:hud?96:24,
                w:hud?512:768, h:hud?288:432, vw:W, vh:H, fps:FPS,
                exclusive:true, contend:!hud, yield:true, guide_hold:false, stall_ms:1200, pan_blocks:true}));
        });
        const started = Date.now(), count = raw.length / BYTES;
        let finished=false;
        const send = () => {
            if(finished) return;
            const n = Math.min(count - 1, Math.floor((Date.now() - started) * FPS / 1000));
            const source = raw.slice(n * BYTES, (n + 1) * BYTES);
            const frame = name==='hazards' ? source : composite(name==='left'?source:this.leftPose,name==='right'?source:this.rightPose,W,H);
            this.heldFrame=frame;
            this.refs.forEach((ref) => this.cr.frame(ref,frame,++this.id));
            if (Date.now()-started >= count*1000/FPS) {
                finished=true;
                if(name==='left') this.leftPose=Buffer.from(source);
                if(name==='right') this.rightPose=Buffer.from(source);
                if(name==='hazards') {this.leftPose=Buffer.from(source);this.rightPose=Buffer.from(source);}
                this.clearTimer(); this.status='Scene held - Reset scene to start again';
                // Keep the layer alive without continuously uploading a still at video rate.
                this.timer=setInterval(()=>this.refs.forEach(ref=>this.cr.frame(ref,this.heldFrame,++this.id)),500);
                if(done) done();
            }
        };
        this.timer=setInterval(send,1000/FPS); send(); this.status='Playing '+name;
        return true;
    }
    clearTimer() {if(this.timer) clearInterval(this.timer);this.timer=null;}
    stop() {this.clearTimer();this.refs.forEach(r=>this.cr.drop(r));this.refs=[];this.leftPose=null;this.rightPose=null;this.heldFrame=null;}
    close() { this.stop(); this.cr.close(); }
}
module.exports = {Player, load, W, H, FPS, BYTES};
