'use strict';
const fs=require('fs'),path=require('path');
const W=384,H=216,FPS=12,BYTES=W*H*3/2;
class Clip {
    constructor(name) {
        if(['left','right','hazards'].indexOf(name)<0) throw Error('Unknown clip');
        const meta=require('./clip-'+name);
        if(meta.w!==W || meta.h!==H || meta.fps!==FPS || !Number.isInteger(meta.frames) || meta.frames<1 || meta.frames>240) throw Error('Invalid clip metadata');
        this.frames=meta.frames;this.fd=null;
        try {
            this.fd=fs.openSync(path.join(__dirname,'clip-'+name+'.pack'),'r');
            if(fs.fstatSync(this.fd).size!==this.frames*BYTES) throw Error('Invalid clip size');
            this.buffer=Buffer.alloc(BYTES);
        } catch(e) {this.close();throw e;}
    }
    read(n) {
        if(this.fd===null) throw Error('Clip closed');
        if(!Number.isInteger(n) || n<0 || n>=this.frames) throw Error('Invalid frame');
        let offset=0;
        while(offset<BYTES) {
            const got=fs.readSync(this.fd,this.buffer,offset,BYTES-offset,n*BYTES+offset);
            if(!got) throw Error('Truncated clip frame');
            offset+=got;
        }
        return this.buffer;
    }
    close() {if(this.fd!==null) {fs.closeSync(this.fd);this.fd=null;}this.buffer=null;}
}
module.exports={Clip,W,H,FPS,BYTES};
