'use strict';
// Isolated local benchmark: exercise the real Player without touching any display.
const assert=require('assert'),EventEmitter=require('events');
const {Player}=require('../apps/vgp_indicator_cinema/player');
class Fake extends EventEmitter {constructor(){super();this.ready=true;}connect(){}video(){return 1;}frame(){}drop(){}close(){}}
const clock=Date.now,interval=global.setInterval,clear=global.clearInterval;
let now=0,callback;
Date.now=()=>now;global.setInterval=fn=>{callback=fn;return 1;};global.clearInterval=()=>{};
const p=new Player(console,()=>({target:'map',left:true,right:true,hazards:true}),new Fake());
try {
 for(let round=0;round<20;round++) {
  p.stop();
  for(const name of ['left','right','hazards']) {
   let done=false;p.play(name,()=>{done=true;});
   while(!done) {now+=84;callback();}
   assert.equal(p.clip,null);
  }
 }
 if(global.gc) {global.gc();global.gc();}
 const held=process.memoryUsage();assert.ok(held.arrayBuffers<2*1024*1024,'Retained Buffer memory exceeds 2 MiB');
 p.stop();if(global.gc) {global.gc();global.gc();}
 console.log(JSON.stringify({sequences:20,heldArrayBuffers:held.arrayBuffers,resetArrayBuffers:process.memoryUsage().arrayBuffers,heldRss:held.rss}));
} finally {p.close();Date.now=clock;global.setInterval=interval;global.clearInterval=clear;}
