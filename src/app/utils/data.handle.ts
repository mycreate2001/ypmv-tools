import { getList, toArray } from "./minitools";

/**
 * 
 * @param keyword keyword
 * @param data 
 * @returns 
 */
export function searchObj<T>(keyword:string,arrs:T|T[]):T[]{
    if(!keyword||!arrs) return [];
    keyword=keyword.toUpperCase();
    return toArray(arrs).filter(arr=>{
        //return Object.keys(arr).some(key=>(arr[key]+"").toUpperCase().includes(keyword))
        return Object.keys(arr).some(key=>{
            const val=obj2String(arr[key]).toUpperCase();
            const result= val.includes(keyword)
            console.log("test searchObj ",{keyword,val,result})
            return result;
        })
    })
}

export function obj2String(obj:any):string{
    if(!['object','string','number'].includes(typeof obj)) return ''
    if(typeof obj!=='object') return obj +""
    //object
    return Object.keys(obj).map(key=>{
        return  obj2String(obj[key])
    }).join("\t")
}

export function separateObj<T>(arrs:T[],key:string,opts:{dataName:string}={dataName:'data'}){
    const groups=getList(arrs,key);
    return groups.map(group=>{
        const tmp:any={};
        tmp[key]=group;
        tmp[opts.dataName]=arrs.filter(x=>x[key]==group);
        return tmp;
    })
}

//*//////////// UPDATE //////////////////
export function getUpdate<T>(newObj:T,oldObj:T,opts:GetUpdateInputOpts={}):UpdateInf[]{
    if(Array.isArray(newObj)||Array.isArray(oldObj)) throw new Error("01:should be object instead of array");
    if(typeof newObj!=='object'||typeof oldObj!=='object') throw new Error("02: New/Old object should be Object")
    const _df:GetUpdateInput={exceptList:[]};
    const _opts=Object.assign(_df,opts);
    const list:UpdateInf[]=[]
    Object.keys(newObj).forEach(key=>{
        if(_opts.exceptList.includes(key)) return;
        const oldVal=oldObj[key]||null;
        const newVal=newObj[key];
        if(oldVal==undefined) return list.push({key,type:'add',oldVal,newVal});
        if(JSON.stringify(oldVal)!=JSON.stringify(newVal)) return list.push({key,type:'update',oldVal,newVal})
    })
    //check delete
    Object.keys(oldObj).forEach(key=>{
        if(_opts.exceptList.includes(key)) return;
        const newVal=newObj[key];
        const oldVal=oldObj[key];
        if(newVal==undefined) return list.push({key,type:'delete',oldVal,newVal})
    })
    return list;
}


export interface GetUpdateInput{
    exceptList:string[]
}

export type GetUpdateInputOpts=Partial<GetUpdateInput>

export interface UpdateInf{
    key:string;
    type:UpdateInfType;
    oldVal:any;
    newVal:any
}

export type UpdateInfType="add"|"delete"|"update"

