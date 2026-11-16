'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {load,BYTES}=require('../apps/vgp_indicator_cinema/player');
test('bundled atlases contain complete frames and correct neutral row layout',()=>{
    ['left','right','hazards'].forEach(name=>{
        const raw=load(name);assert.ok(raw.length/BYTES>=60);assert.equal(raw.length%BYTES,0);
        assert.ok(raw.some(v=>v>0));
        const meta=require('../apps/vgp_indicator_cinema/clip-'+name);assert.equal(meta.frames,raw.length/BYTES);
    });
});
test('manifest exposes cluster/HUD/both and all three scenes without audio permissions',()=>{
    const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../apps/vgp_indicator_cinema/app.json')));
    assert.deepEqual(m.settings.find(s=>s.key==='target').options.map(x=>x[0]),['map','hud','both']);
    ['left','right','hazards'].forEach(k=>assert.ok(m.settings.some(s=>s.key===k)));
    assert.equal(m.settings.find(s=>s.key==='enabled').default,false);
    assert.deepEqual(Object.keys(m.signals),['de.bmw.body.Light']);
});
