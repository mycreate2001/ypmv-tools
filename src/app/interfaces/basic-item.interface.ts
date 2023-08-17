import { createOpts, uuid } from "../utils/minitools";
import { UrlData, createUrlData } from "./urldata.interface";
// export interface BasicItemData{
//     id:string;          // id of item
//     name:string;        // name of item
//     type:string;        // type, example 'cover','tool','model',...
//     image:UrlData;      // images of item
// }
export interface BasicItem {
    id:string;          // id of item
    name:string;        // name of item
    type:string;        // type, example 'cover','tool','model',...
    image:UrlData;     // images of item
    
}

export function createBasicItem(opts?:Partial<BasicItem>):BasicItem{
    const df:BasicItem={
        id:uuid(),
        name:'',
        type:'',
        image:createUrlData(opts.image)
    }
    return createOpts(df,opts)
}