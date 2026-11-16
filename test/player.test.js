'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),EventEmitter=require('events');
const {Player,BYTES}=require('../apps/vgp_indicator_cinema/player');
class Fake extends EventEmitter {
    constructor(){super();this.ready=true;this.layers=new Map();this.frames=[];this.n=0;}
    connect(){} close(){this.closed=true;}
    video(o){const n=++this.n;this.layers.set(n,o);return n;}
    frame(r,b){this.frames.push([r,b.length]);} drop(r){this.layers.delete(r);}
}
test('same atlas reaches map and HUD; replacement/Stop releases all layers',()=>{
    const cr=new Fake(),p=new Player(console,()=>({target:'both',left:true,right:true,hazards:true}),cr);
    try {
        p.play('left');assert.equal(cr.layers.size,2);assert.deepEqual([...cr.layers.values()].map(o=>o.target),['map','hud']);
        cr.frames.forEach(x=>assert.equal(x[1],BYTES));assert.equal([...cr.layers.values()][1].yield,true);
        p.play('right');assert.equal(cr.layers.size,2);assert.equal(cr.n,4);
        p.stop();assert.equal(cr.layers.size,0);assert.equal(p.timer,null);
    }finally{p.close();}
});
test('disconnected renderer and disabled scene create no layers',()=>{
    const cr=new Fake(),opt={target:'map',left:false},p=new Player(console,()=>opt,cr);
    p.play('left');assert.equal(cr.n,0);opt.left=true;cr.ready=false;p.play('left');assert.equal(cr.n,0);p.close();
});
