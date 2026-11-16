'use strict';
class Controller {
    constructor(play,stop) { this.play=play; this.stop=stop; this.resetState(); }
    resetState() { this.seated={left:false,right:false}; this.queue=[]; this.busy=null; this.active='off'; this.generation=(this.generation||0)+1; }
    update(value,enabled) {
        if (!enabled || value===null) return;
        if(value==='off') { this.active='off'; return; }
        if(value===this.active) return;
        this.active=value; this.trigger(value);
    }
    trigger(name) {
        if(['left','right','hazards'].indexOf(name)<0) return;
        if(name!=='hazards' && this.seated[name]) return;
        if(this.busy===name || this.queue.indexOf(name)>=0) return;
        if(name==='hazards' && !['left','right'].every(s=>this.seated[s] || this.busy===s || this.queue.indexOf(s)>=0)) return;
        this.queue.push(name); this.next();
    }
    next() {
        if(this.busy || !this.queue.length) return;
        const name=this.queue.shift(),generation=this.generation; this.busy=name;
        const accepted=this.play(name,()=>{
            if(generation!==this.generation) return;
            if(name!=='hazards') this.seated[name]=true;
            this.busy=null; this.next();
        });
        if(accepted===false) {this.busy=null; this.queue=[];}
    }
    tick() {}
    reset() {this.resetState(); this.stop();}
}
module.exports={Controller};
