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