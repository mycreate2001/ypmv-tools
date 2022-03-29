import { Pipe, PipeTransform } from '@angular/core';
const _NO_IMAGE="../../../assets/image/no-image.png"
@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  transform(image:any|any[],pos:number=0): string {
    const debug=false;
    if(debug) console.log("image:",{image,pos})
    if(!image || [].concat(image).length==0) {
      if(debug) console.log("#K1:NoImage")
      return _NO_IMAGE
    }
    const _images=[].concat(image);
    const _image=_images[pos]
    if(!image){
      if(debug) console.log("#K2:NoImage")
      return _NO_IMAGE;
    }
    if(typeof _image=='string') {
      if(debug) console.log("#K3:string")
      return _image;
    }
    if(debug) console.log("#K4:UrlData")
    return _image.url||_NO_IMAGE
    
  }

}
