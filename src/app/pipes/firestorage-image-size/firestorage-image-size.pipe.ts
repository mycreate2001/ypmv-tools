import { Pipe, PipeTransform } from '@angular/core';
const _FIRESTORAGE_URL='https://firebasestorage.googleapis.com'
@Pipe({
  name: 'size'
})
export class FirestorageImageSizePipe implements PipeTransform {

  transform(url: string, w:number=null,h:number=null): string {
    if(!url.startsWith(_FIRESTORAGE_URL)) return url;//not google firestorage
    if(!w||!h) return url;// size not correctly
    return url+"?w="+w+"&h="+h
  }

}
