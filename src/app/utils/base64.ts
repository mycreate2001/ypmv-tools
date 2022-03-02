/** sample
base64:			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
contentType:	"image/png"
data:			"iVBORw0KGgoAAAANSUhEUg..."
*/
export class Base64{
    data:string;
    contentType:string;
    constructor(base64:string){
        const str=base64.substring(0,50);
        const _1ST="data:";
        const _2ND=";base64,";
        const first=_1ST.length
        const last=str.indexOf(_2ND);
        this.contentType=str.substring(first,last);
        this.data=base64.substring(last+_2ND.length);
        console.log({data:this.data,contentType:this.contentType})
    }
}