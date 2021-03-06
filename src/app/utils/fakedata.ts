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
 * %RND%        random 0 ~ 10000
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
            //const
            if(typeof tmp!='string'||!(tmp+"").includes("%")) {
                out[key]=tmp;
                return;
            }
            //object
            tmp=makeObject('i',tmp,i);
            tmp=makeObject('time',tmp,new Date());
            tmp=makeObject(key,tmp,out[key]?out[key]:"");
            tmp=makeObject('RND',tmp,Math.round(Math.random()*10000));
            tmp=correctNumber('N',tmp);
            out[key]=tmp;
        })
        outs.push(out);
    }
    return outs;
};

/**
 * make template data
 * @param n number of array elements
 * @param callback callback handler each element, function(i,n,results)
 * @returns arrays (results)
 */
export function fakedata(n:number,callback:Function){
    const outs=[];
    for (let i=0;i<n;i++){
        const out=callback(i,n,outs);
        outs.push(out);
    }
    return outs;
}