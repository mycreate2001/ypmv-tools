import { getList, toArray } from "./minitools";


/**
 * The `searchObj` function takes a keyword and an object or an array of objects, and returns an array
 * of objects that contain the keyword in any of their property values.
 * @param {string} keyword - A string representing the keyword to search for in the objects.
 * @param {T|T[]} arrs - The `arrs` parameter is either a single object of type `T` or an array of
 * objects of type `T`.
 * @returns The function `searchObj` returns an array of objects that match the given keyword.
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

/**
 * The function `searchObj2` searches for a keyword in a given object and returns true if the keyword
 * is found, otherwise it returns false.
 * @param {string} keyword - The keyword parameter is a string that represents the word or phrase you
 * want to search for within the object.
 * @param {any} obj - The `obj` parameter is an object that you want to search for a specific keyword.
 * @returns a boolean value.
 */
export function searchObj2(keyword:string,obj:any):boolean{
    if(!keyword||!obj) return false;
    if(!['string','object','number'].includes(typeof obj)) return false
    //value
    if(typeof obj!=='object') {
        const result=(obj+"").toUpperCase().includes(keyword.toUpperCase());
        // if(result) console.log("searchObj2/K1 ",{keyword,obj,result})
        return result;
    }
    //object
    const result= Object.keys(obj).some(key=>searchObj2(keyword,obj[key]))
    // console.log("searchObj2/K2 ",{keyword,obj,result})
    return result;
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

