'use strict';
// Build-time only. No decoder, subprocess or audio channel is used on the car.
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=path.join(__dirname,'..'),W=384,H=216,FPS=12;
const sources={left:'left-woman.mp4',right:'right-jason.mp4',hazards:'hazards-paparazzi.mp4'};
Object.keys(sources).forEach((name)=>{
    const yuv=execFileSync('ffmpeg',['-loglevel','error','-i',path.join(root,'media',sources[name]),'-an','-vf',`fps=${FPS},scale=${W}:${H}:flags=lanczos`,'-pix_fmt','yuv420p','-f','rawvideo','pipe:1'],{maxBuffer:32*1024*1024});
    const size=W*H*3/2,atlas=Buffer.alloc(yuv.length),luma=W*H,quarter=luma/4;
    if(yuv.length%size)throw Error('Incomplete YUV frame');
    for(let f=0;f<yuv.length/size;f++){
        const base=f*size;yuv.copy(atlas,base,base,base+luma);
        for(let r=0;r<H/2;r++){
            yuv.copy(atlas,base+luma+r*W,base+luma+r*W/2,base+luma+(r+1)*W/2);
            yuv.copy(atlas,base+luma+r*W+W/2,base+luma+quarter+r*W/2,base+luma+quarter+(r+1)*W/2);
        }
    }
    const data=zlib.gzipSync(atlas,{level:9}).toString('base64');
    fs.writeFileSync(path.join(root,'apps/vgp_indicator_cinema','clip-'+name+'.js'),"'use strict';\nmodule.exports="+JSON.stringify({w:W,h:H,fps:FPS,frames:yuv.length/size,data})+';\n');
    console.log(name,yuv.length/size,'frames',Math.round(data.length/1024),'KB base64');
});
