import { getList } from "./minitools";

/**
 * 
 * @param keyword keyword
 * @param data 
 * @returns 
 */
export function searchObj<T>(keyword:string,arrs:T|T[]):T[]{
    if(!keyword||!arrs) return [];
    keyword=keyword.toUpperCase();
    return [].concat(arrs).filter(arr=>{
        return Object.keys(arr).some(key=>(arr[key]+"").toUpperCase().includes(keyword))
    })
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