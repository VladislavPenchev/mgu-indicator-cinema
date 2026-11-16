'use strict';
// Image-left and image-right retain independent poses; feather their shared seam.
function composite(left,right,w,h) {
    const out=Buffer.alloc(w*h*3/2),luma=w*h;
    function plane(base,stride,width,height) {
        const mid=width/2,feather=4;
        for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
            const i=base+y*stride+x,a=Math.max(0,Math.min(1,(x-mid+feather)/(2*feather)));
            out[i]=Math.round(left[i]*(1-a)+right[i]*a);
        }
    }
    plane(0,w,w,h); plane(luma,w,w/2,h/2); plane(luma+w/2,w,w/2,h/2);
    return out;
}
module.exports={composite};
