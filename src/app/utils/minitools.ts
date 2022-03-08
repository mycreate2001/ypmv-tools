export function compareObject(obj1:object,obj2:object,debug=true):boolean{
    //keys not compare
    const keys1=Object.keys(obj1);
    const keys2=Object.keys(obj2);
    const label=digit("compareObject",{length:10});
    // console.log("[%s] test-001",label,{obj1,obj2});
    //keys is not same
    if(keys1.length!=keys2.length) {
        if(debug) console.log("[%s] case1",label);
        return false;
    }
    
    let tmp1,tmp2;
    return keys1.every(key=>{
        tmp2=obj2[key];
        //not exit
        if(tmp2==undefined) {
            if(debug) console.log("[%s] case2",label);
            return false;
        }
        tmp1=obj1[key];
        //type
        if(typeof tmp1!=typeof tmp2){
            if(debug) console.log("[%s] case3",label);
            return false;
        }

        //array
        if(Array.isArray(tmp1)) {
            const result=compareArr(tmp1,tmp2,false);
            if(!result) if(debug) console.log("[%s] case4",label);
            return result;
        }

        //not array
        const result= tmp1==tmp2?true:false;
        if(!result && debug) console.log("[%s] case5",label);
        return result;
    })
}

export function compareArr(arr1:any[],arr2:any[],debug=true):boolean{
    const PRG=digit("compareArr",{length:15})
    if(arr1.length!=arr2.length) {
        if(debug) console.log('[%s] case1',PRG);
        return false;
    }
    const round1=arr1.every(arr=>arr2.some(x=>compareObject(x,arr)));
    const round2=arr2.every(arr=>arr1.some(x=>compareObject(x,arr)));
    const result= round1&&round2
    if(!result && debug) console.log('[%s] case2',PRG);
    return result;
}

export function getList(arrs:any[],key:string="id",debug:boolean=false):string[]{
    const outs=[];
    let tmp:any;
    arrs.forEach(arr=>{
        tmp=arr[key];
        if(!tmp||outs.includes(tmp)) {
            if(debug) console.log("invailid data",{arr,key,tmp});
            return;
        }
        if(debug) console.log("validate data:",{arr,key,tmp})
        outs.push(tmp+"");
    })
    return outs;
}

export function createOpts(defaultValue:Object,opts?:any,debug:boolean=false):object{
    if(!opts) return defaultValue;
    Object.keys(defaultValue).forEach(key=>{
        if(opts[key]==undefined) return;
        defaultValue[key]=opts[key]
    });
    if(debug) console.log("\ncreateOpts\n",{opts,result:defaultValue})
    return {...defaultValue};
}

export declare type AlignType="Right"|"Left"|"Center"
export interface DigitOpts{
    length?:number;
    texture?:string;
    align?:AlignType;
}

export function digit(ip:any,opts?:DigitOpts):string{
    const _opts=createOpts({length:2,texture:" ",align:'Right'},opts);
    console.log("test",{ip,opts:_opts})
    let texture=_opts['texture'] as string;
    const length=_opts["length"] as number;
    const align=_opts["align"] as AlignType;
    // const l=(ip+"").length;
    if(!texture.length) texture=" ";
    else if(texture.length>1) texture=texture.substring(0,0);
    if(align=="Right"){
        texture=makeTexture(length,texture)+ ip;
        return texture.substring(texture.length-length);
    }
    else if(align=="Left"){
        texture=ip+makeTexture(length,texture);
        return texture.substring(0,length)
    }
    //center
    else{
        texture=makeTexture(length,texture);
        texture=texture+ip+texture;
        const l1=Math.round(texture.length/2-length/2)
        return texture.substring(l1,length);

    }

}

/**
 * make id diffrent from arrays
 * @param arrs arrays, it need when want to check duplicate
 * @param len the length of id
 * @returns id
 * @example const arrs=[{name:'abc',id:'001'},{name:'xyz',id:'002'}]
 *          const id=makeId(3,arrs);//id='xxx'
 */
export function makeId(len:number=15,arrs:any|any[]=[]):string{
    let id:string;
    const _arrs=[].concat(arrs);
    let done:boolean=false;
    while(done==false){
        id=makeRandStr(len);
        if(!_arrs.find(x=>x.id==id)) done=true;
    }
    return id;
}


export function convert(obj:any,keys?:string[]){
    if(!obj['constructor']) return obj;
    //class
    const out:any={};
    keys=keys||Object.keys(obj);
    keys.forEach(key=>{
      if(obj[key]==undefined) return;
      out[key]=convert(obj[key])
    })
    return out;
  }
  


//private
function makeRandStr(len:number=15){
    const n=Math.ceil(len/10);
    let str:string='';
    for(let i=0;i<n;i++){
        str+=Math.random().toString(36).substring(2,11)
    }
    return str.substring(0,len-1)
}

function makeTexture(n:number,texture:string):string{
    if(n<1) return "";
    let out=""
    for(let i=0;i<n;i++){
        out+=texture;
    }
    return out;
}


