function makeObject(key:string,str:string,data:any){
    return str.replace(new RegExp('%'+key+'%','g'),data);
}
function correctNumber(key:string,str:string):number|string{
    if(!str.includes(key)) return str;//not convert 
    str=makeObject(key,str,"");
    const result= parseInt(str);
    if(isNaN(result)) return 0;
    return result;
}
/** 
 * @param n     element number
 * @param opts  opts={id:'%i%}
 * item meaning
 * %i%          no [0-->n-1]
 * %<item>%     value of before item
 * %time%       current
 * %N%          type is number
 * [array]      each elememt of array
 */
export function fake(n:number=5,opts:object){
    let outs=[];
    let keys=Object.keys(opts);
    let tmp:any;
    for(let i=0;i<n;i++){
        const out={};  
        keys.forEach(key=>{
            tmp=opts[key];
            //arrays
            if(Array.isArray(tmp)){//array
                out[key]=tmp[i%tmp.length];
                return;
            }
            //object
            tmp=makeObject('i',tmp,i);
            tmp=makeObject('time',tmp,new Date());
            tmp=makeObject(key,tmp,out[key]?out[key]:"");
            tmp=correctNumber('N',tmp);
            out[key]=tmp;
        })
        outs.push(out);
    }
    return outs;
};