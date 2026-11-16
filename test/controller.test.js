'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Controller}=require('../apps/vgp_indicator_cinema/controller');
const {direction}=require('../apps/vgp_indicator_cinema/signals');
test('BMW enum names and numbers; unknown/emergency signals never trigger romance',()=>{
    [7,9,18,20,22,'DAUERBLINKEN_LINKS'].forEach(x=>assert.equal(direction({activeFunctionIndicateDirection:x}),'left'));
    [8,10,19,21,23,'TIPPBLINKEN_RECHTS'].forEach(x=>assert.equal(direction({activeFunctionIndicateDirection:x}),'right'));
    assert.equal(direction(6),'hazards');assert.equal(direction('WARNBLINKEN_MANUELL'),'hazards');
    [null,undefined,1,5,16,17,24,255,'CRASH_BLINKEN'].forEach(x=>assert.equal(direction(x),null));
    assert.equal(direction(0),'off');
});
test('duplicates and short off pulses do not restart video; genuine off rearms',()=>{
    let time=0,plays=[],stops=0;const c=new Controller(x=>plays.push(x),()=>stops++,()=>time);
    c.update('left',true);c.update('left',true);c.update('off',true);time=100;c.tick();c.update('left',true);
    assert.deepEqual(plays,['left']);assert.equal(stops,0);
    c.update('off',true);time=321;c.tick();assert.equal(stops,1);c.update('left',true);
    assert.deepEqual(plays,['left','left']);
});
test('direction changes, hazards priority and disable cancel',()=>{
    const plays=[];let stops=0;const c=new Controller(x=>plays.push(x),()=>stops++);
    c.update('left',true);c.update('right',true);c.update('hazards',true);c.update('hazards',true);
    assert.deepEqual(plays,['left','right','hazards']);c.update('left',false);assert.equal(stops,1);
    c.update(null,true);assert.equal(c.active,'off');
});
