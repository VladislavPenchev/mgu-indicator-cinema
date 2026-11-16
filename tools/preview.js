'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const media={'/left.mp4':'left-woman.mp4','/right.mp4':'right-jason.mp4','/hazards.mp4':'hazards-paparazzi.mp4'};
http.createServer((req,res)=>{
    if(media[req.url]){const file=path.join(root,'media',media[req.url]);res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':fs.statSync(file).size});fs.createReadStream(file).pipe(res);return;}
    if(req.url!=='/'){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'preview.html')));
}).listen(18990,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:18990'));
