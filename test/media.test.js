'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {Clip,BYTES}=require('../apps/vgp_indicator_cinema/clip-reader');
const crypto=require('crypto');

test('disk clips read one reusable frame, verify entire atlas checksum and close',()=>{
 ['left','right','hazards'].forEach(name=>{
  const clip=new Clip(name),hash=crypto.createHash('sha256'),first=clip.read(0);
  try {
   assert.equal(first.length,BYTES);assert.ok(clip.frames>=60);
   for(let n=0;n<clip.frames;n++) {const frame=clip.read(n);assert.equal(frame,first);hash.update(frame);}
   assert.equal(hash.digest('hex'),require('../apps/vgp_indicator_cinema/clip-'+name).sha256);
   assert.throws(()=>clip.read(-1));assert.throws(()=>clip.read(clip.frames));
  } finally {clip.close();}
  assert.equal(clip.fd,null);assert.equal(clip.buffer,null);assert.throws(()=>clip.read(0));clip.close();
 });
});
test('no base64 atlases or runtime whole-file clip loads',()=>{
 ['left','right','hazards'].forEach(name=>assert.equal(require('../apps/vgp_indicator_cinema/clip-'+name).data,undefined));
 assert.throws(()=>new Clip('../other'));
 const reader=fs.readFileSync(path.join(__dirname,'../apps/vgp_indicator_cinema/clip-reader.js'),'utf8');
 assert.ok(!/readFileSync|gunzip|base64/.test(reader));
});

test('manifest exposes cluster/HUD/both and all three scenes without audio permissions',()=>{
    const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../apps/vgp_indicator_cinema/app.json')));
    assert.deepEqual(m.settings.find(s=>s.key==='target').options.map(x=>x[0]),['map','hud','both']);
    ['left','right','hazards'].forEach(k=>assert.ok(m.settings.some(s=>s.key===k)));
    assert.equal(m.settings.find(s=>s.key==='enabled').default,false);
    assert.deepEqual(Object.keys(m.signals),['de.bmw.body.Light']);
});
