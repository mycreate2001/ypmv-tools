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

// export function getList(arrs:any[],key:string="id",debug:boolean=false):string[]{
//     const outs=[];
//     let tmp:any;
//     arrs.forEach(arr=>{
//         tmp=arr[key];
//         if(!tmp||outs.includes(tmp)) {
//             if(debug) console.log("invailid data",{arr,key,tmp});
//             return;
//         }
//         if(debug) console.log("validate data:",{arr,key,tmp})
//         outs.push(tmp+"");
//     })
//     return outs;
// }


//////// get list 2 /////////////////////////////////
export interface GetList2Option{
    list:string[];
}

export const GetList2OptionDefault:GetList2Option={
    list:[]
}

/**
 * The function `getList2` takes an array of objects, extracts a specified key from each object, and
 * returns a list of unique values for that key.
 * @param {any[]} arrs - An array of objects from which to extract values for the list.
 * @param {string} [key=id] - The key parameter is a string that specifies the property name to be used
 * as the key for each object in the array.
 * @param [options] - The `options` parameter is an optional object that allows you to customize the
 * behavior of the `getList2` function. It accepts the following properties:
 * @returns the updated list array.
 */
export function getList(arrs:any[],key:string|string[]='id',options?:Partial<GetList2Option>){
    const _opts=Object.assign({},GetList2OptionDefault,options);
    const list=_opts.list;
    let tmp:any[]=[];
    const keys:string[]=toArray(key);
    arrs.forEach(arr=>{
        tmp=keys.map(key=>arr[key]);
        tmp.forEach(t=>{
            if(!['number','string'].includes(typeof t)) return;
            if(list.includes(t+"")) return
            list.push(t+"")
        })
    })
    return list;
}

/**
 * The function toArray converts a single value or an array of values into an array.
 * @param {T|T[]} data - The `data` parameter can be of type `T` or `T[]`. This means it can either be
 * a single value of type `T` or an array of values of type `T`.
 * @returns an array.
 */
export function toArray<T>(data:T|T[]):T[]{
    return Array.isArray(data)?data:[data]
}


export function createOpts<T>(defaultObj:T,...opts:Partial<T>[]):T{
    // if(!opts) return defaultValue;
    // Object.keys(defaultValue).forEach(key=>{
    //     if(opts[key]==undefined) return;
    //     defaultValue[key]=opts[key]
    // });
    // return {...defaultValue};
    opts.forEach(opt=>{
        Object.keys(defaultObj).forEach(key=>{
            const val=opt[key];
            if(val==undefined) return;
            defaultObj[key]=opt[key]
        })
    })
    return {...defaultObj}
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

  
export interface Obj2AttrOpts{
    delimiter?:string;
    space?:string;
}
/**
 * convert object to attribute
 * @param obj object {width:100,height:50}
 * @param opts 
 * @returns 
 * @example const obj={width:100,height:50};
 *  const str=obj2attr(obj,{delimitor:",",space:"\""}) 
 *  //experted result str='width="100",height="50"'
 */
export function obj2attr(obj:object,opts:Obj2AttrOpts={}):string{
    const _opts=Object.assign({delimiter:',',space:''},opts)
    return Object.keys(obj).map(key=>`${key}=${_opts.space}${obj[key]}${_opts.space}`)
        .join(_opts.delimiter)
}

export interface CompareArraysInput{
    items:string[];
    condition:'All items same'|'one of items is same'
}
function createCompareArraysInput(opts:CompareArraysInputOpts={}){
    const df:CompareArraysInput={
        items:[],
        condition:'All items same'
    }
    return createOpts(df,opts)
}
export type CompareArraysInputOpts=Partial<CompareArraysInput>
export function compareArrays(arrs1:object[],arrs2:object[],opts:CompareArraysInputOpts={}):boolean{
    const _opts=createCompareArraysInput(opts);
    const _items=!_opts.items.length?_opts.items:Object.keys(arrs1[0])
    return arrs1.some(arr1=>arrs2.includes(arr2=>{
            if((_opts.condition=='All items same' && _items.every(item=>arr1[item]==arr2[item]))||
                (_opts.condition=='one of items is same' && _items.some(item=>arr1[item]==arr2[item]))
            ) return true;
            return false;
        })
    )
}

export function uuid(){
    return new Date().getTime().toString(36)+"-"+ Math.random().toString(36).substring(2,10)
}

////////////////////// private ///////////////////////////////
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


