import { createOpts } from "../utils/minitools";

//** data */
export interface UrlData{
    url:string;
    thumbnail:string;
    caption:string;
}

//export type ModelDataOpts = Partial<ModelData>
export type UrlDataOpts = Partial<UrlData>

export function createUrlData(opts?:UrlDataOpts|string){
    const df:UrlData={
        url:'',
        thumbnail:'',
        caption:''
    }
    return typeof opts=='string'? createOpts(df,{url:opts}):createOpts(df,opts)
}