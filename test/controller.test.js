'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Controller}=require('../apps/vgp_indicator_cinema/controller');
const {direction}=require('../apps/vgp_indicator_cinema/signals');
test('BMW enum decoding excludes emergency flashing',()=>{
 [7,9,18,20,22,'DAUERBLINKEN_LINKS'].forEach(x=>assert.equal(direction({activeFunctionIndicateDirection:x}),'left'));
 [8,10,19,21,23,'TIPPBLINKEN_RECHTS'].forEach(x=>assert.equal(direction(x),'right'));
 assert.equal(direction(6),'hazards');assert.equal(direction(0),'off');[null,undefined,1,5,16,17,24,255].forEach(x=>assert.equal(direction(x),null));
});
function setup(){const plays=[],done=[];let stops=0;const c=new Controller((n,cb)=>{plays.push(n);done.push(cb);return true;},()=>stops++);return {c,plays,done,stops:()=>stops};}
test('off preserves scene, second entry queues, hazards require both occupants',()=>{
 const {c,plays,done,stops}=setup();c.update('hazards',true);assert.deepEqual(plays,[]);
 c.update('left',true);c.update('off',true);c.tick();assert.equal(stops(),0);
 c.update('right',true);c.update('off',true);c.update('hazards',true);assert.deepEqual(plays,['left']);
 done.shift()();assert.deepEqual(plays,['left','right']);assert.equal(c.seated.left,true);
 done.shift()();assert.deepEqual(plays,['left','right','hazards']);assert.equal(c.seated.right,true);
 done.shift()();c.update('off',true);assert.equal(stops(),0);
 c.update('left',true);assert.equal(plays.length,3);
});
test('right then left works and Reset invalidates outstanding callbacks',()=>{
 const {c,plays,done,stops}=setup();c.trigger('right');c.trigger('left');done.shift()();done.shift()();
 assert.deepEqual(plays,['right','left']);assert.deepEqual(c.seated,{left:true,right:true});
 c.trigger('hazards');const stale=done.shift();c.reset();stale();assert.equal(stops(),1);assert.equal(c.busy,null);assert.deepEqual(c.seated,{left:false,right:false});
 c.trigger('left');assert.equal(plays[3],'left');
});
test('manual tests survive automatic disabled notifications; rejected play never marks occupant',()=>{
 const {c,plays}=setup();c.trigger('left');c.update('off',false);assert.deepEqual(plays,['left']);assert.equal(c.busy,'left');
 const rejected=new Controller(()=>false,()=>{});rejected.trigger('right');assert.equal(rejected.busy,null);assert.equal(rejected.seated.right,false);
});
