import { Pipe, PipeTransform } from '@angular/core';
const _NO_IMAGE="../../../assets/image/no-image.png"
@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  transform(image:any|any[],pos:number=0): string {
    // console.log("image:",image)
    if(!image || !image.length) return _NO_IMAGE
    const _images=[].concat(image);
    const _image=_images[pos]
    if(!image) return _NO_IMAGE;
    if(typeof _image=='string') return _image;
    return _image.url||_NO_IMAGE
    
  }

}
