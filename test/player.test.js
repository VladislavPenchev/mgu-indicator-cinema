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
        p.play('right');assert.equal(cr.layers.size,2);assert.equal(cr.n,2);
        p.stop();assert.equal(cr.layers.size,0);assert.equal(p.timer,null);
    }finally{p.close();}
});
test('disconnected renderer and disabled scene create no layers',()=>{
    const cr=new Fake(),opt={target:'map',left:false},p=new Player(console,()=>opt,cr);
    p.play('left');assert.equal(cr.n,0);opt.left=true;cr.ready=false;p.play('left');assert.equal(cr.n,0);p.close();
});

test('entry completes after lamp release and holds unchanged scene until reset',t=>{
 t.mock.timers.enable({apis:['Date','setInterval'],now:0});
 const cr=new Fake(),p=new Player(console,()=>({target:'map',left:true,right:true,hazards:true}),cr);
 try {
  let completed=0;p.play('left',()=>completed++);t.mock.timers.tick(6500);
  assert.equal(completed,1);assert.equal(cr.layers.size,1);const left=Buffer.from(p.leftPose),held=Buffer.from(p.heldFrame);
  t.mock.timers.tick(30000);assert.equal(cr.layers.size,1);assert.deepEqual(p.heldFrame,held);
  p.play('right');t.mock.timers.tick(6500);assert.deepEqual(p.leftPose,left);assert.equal(cr.layers.size,1);
  p.stop();assert.equal(cr.layers.size,0);assert.equal(p.heldFrame,null);
 }finally{p.close();}
});
test('YUV composition preserves left and right sides in all three atlas planes',()=>{
 const {composite}=require('../apps/vgp_indicator_cinema/composite');
 const frame=composite(Buffer.alloc(BYTES,40),Buffer.alloc(BYTES,200),384,216);
 for(const base of [0,384*216,384*216+192]) {
  const width=base===0?384:192;assert.equal(frame[base],40);assert.equal(frame[base+width-1],200);
 }
});
