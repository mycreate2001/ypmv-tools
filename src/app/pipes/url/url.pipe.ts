import { Pipe, PipeTransform } from '@angular/core';
import { UrlData } from 'src/app/interfaces/util.model';
const _NO_IMAGE="../../../assets/image/no-image.png"
@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  transform(image:string|string[]|UrlData|UrlData[],pos:number=0,type:'thumb'|'image'='image'): string {
    const debug=false;
    if(debug) console.log("image:",{image,pos})
    //#1 Empty
    if(!image || [].concat(image).length==0) {
      if(debug) console.log("#K1:NoImage")
      return _NO_IMAGE
    }
    const _images=[].concat(image);
    const _image=_images[pos]
    //#2 image at pos is empty
    if(!image){
      if(debug) console.log("#K2:NoImage")
      return _NO_IMAGE;
    }
    // #3 Image is string (url)
    if(typeof _image=='string') {
      if(debug) console.log("#K3:string")
      return _image;
    }

    //#4 Image as type
    if(debug) console.log("#K4:UrlData")
    return type=='thumb'?_image.thumbnail||_image.url||_NO_IMAGE: _image.url||_NO_IMAGE
  }

}
