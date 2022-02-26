export function compareObject(obj1:object,obj2:object):boolean{
    //keys not compare
    const keys1=Object.keys(obj1);
    const keys2=Object.keys(obj2);
    if(keys1!=keys2) return false;//keys is not same
    let tmp1,tmp2;
    return keys1.every(key1=>{
        tmp2=obj2[key1];
        if(tmp2==undefined) return false;//not exist this function
        tmp1=obj1[key1];
        return tmp1==tmp2?true:false
    })
}