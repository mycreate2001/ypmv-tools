import { createOpts } from "../utils/minitools";
import { UrlData } from "./util.model";

/** basic infor of tool/cover when display */
export type BasicDataType="cover"|"tool"
export interface BasicData{
    id:string;                      // id
    name:string;                    // name of information ex: repair station key
    group:string;                   // category, group of tool/cover
    type:BasicDataType;             // information type
    images:UrlData[]|string[]     // image
}

export interface BasicDataOpts{
    id?:string;                      // id
    name?:string;                    // name of information ex: repair station key
    group?:string;                   // category, group of tool/cover
    type?:BasicDataType;             // information type
    images?:UrlData[]|string[]     // image
}

export function createBasicData(opts?:BasicDataOpts){
    const df:BasicData={
        id:'',                      // id
        name:'',                    // name of information ex: repair station key
        group:'',                   // category, group of tool/cover
        type:'tool',                // information type
        images:[]                   // image  
    }
    return createOpts(df,opts)
}



/*** for view page */
export interface BasicView extends BasicData{
    childrenId:ChildData[];
}

export interface BasicViewOpts extends BasicDataOpts{
    childrenId?:ChildData;
}

export function createBasicView(opts?:BasicViewOpts){
    const df:BasicView={
        ...createBasicData(),
        childrenId:[]
    }
    return createOpts(df,opts)
}

export interface ChildData{
    id:string;
    type:BasicDataType
}