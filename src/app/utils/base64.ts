import { UrlData, createUrlData } from "../interfaces/urldata.interface";
import { toArray } from "./minitools";

/** sample
base64:			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
contentType:	"image/png"
data:			"iVBORw0KGgoAAAANSUhEUg..."
*/
export class Base64{
    data:string='';
    contentType:string='';
    extension:string='jpg';
    constructor(base64:string){
        this.data=base64;
        const str=base64.substring(0,50);
        const _1ST="data:";
        const _2ND=";base64,";
        if(!base64.includes(_2ND)) {console.log("data is not base64");return }
        const first=_1ST.length
        const last=str.indexOf(_2ND);
        this.contentType=str.substring(first,last);
        this.data=base64.substring(last+_2ND.length);
        this.extension=this.contentType.split("/")[1];
        console.log({data:str,contentType:this.contentType,extention:this.extension})
    }
}

/**
 * The function `getNewImages` takes in a parameter `images` which can be a string, an array of
 * strings, an object of type `UrlData`, or an array of `UrlData` objects, and returns an array of
 * `UrlData` objects that have URLs starting with "http://" or "https://".
 * @param {string|string[]|UrlData|UrlData[]} images - The `images` parameter can be one of the
 * following types:
 * @returns an array of UrlData objects.
 */
export function getNewImages(images:string|string[]|UrlData|UrlData[]):{newImages:UrlData[],existImages:UrlData[]}{
    const newImages:UrlData[]=[];
    const existImages:UrlData[]=[];
    toArray(images).forEach(image=>{
        const _image=typeof image==='string'?createUrlData({url:image}):image
        if(_image.url.startsWith("http://")||_image.url.startsWith("https://"))
            return existImages.push(_image);
        newImages.push(_image)
    })
    return {newImages,existImages};
}