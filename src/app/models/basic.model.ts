import { createOpts } from "../utils/minitools";
import { UrlData } from "./util.model";

/** basic infor of tool/cover when display */
export type BasicDataType="cover"|"tool"
/**
 * basicView for display model/cover
 * @param id    id of cover/model
 * @param name  cover/model name
 * @param group category of model/cover
 * @param type tool or model
 * @param images    images of cover/model
 */
export interface BasicData{
    id:string;                      // id
    name:string;                    // name of information ex: repair station key
    group:string;                   // category, group of tool/cover
    type:BasicDataType;             // information type
    images:UrlData[]                // image
    modelId?:string;
    statusList:string[];
}

// /**
//  * basicView for display model/cover
//  * @param id    id of cover/model
//  * @param name  cover/model name
//  * @param group category of model/cover
//  * @param type tool or model
//  * @param images    images of cover/model
//  */
// export interface BasicDataOpts{
//     id?:string;                      // id
//     name?:string;                    // name of information ex: repair station key
//     group?:string;                   // category, group of tool/cover
//     type?:BasicDataType;             // information type
//     images?:UrlData[]     // image
// }

export type BasicDataOpts=Partial<BasicData>

export function createBasicData(opts?:BasicDataOpts){
    const df:BasicData={
        id:'',                      // id
        name:'',                    // name of information ex: repair station key
        group:'',                   // category, group of tool/cover
        type:'tool',                // information type
        images:[],                   // image 
        modelId:'',
        statusList:[]
    }
    return createOpts(df,opts)
}



/**
 * basicView for display model/cover
 * @param id    id of cover/model
 * @param name  cover/model name
 * @param group category of model/cover
 * @param type tool or model
 * @param images    images of cover/model
 * @param childrenId    children of cover/model
 */
export interface BasicView extends BasicData{
    childrenId:ChildData[];
}

/**
 * basicView for display model/cover
 * @param id    id of cover/model
 * @param name  cover/model name
 * @param group category of model/cover
 * @param type tool or model
 * @param images    images of cover/model
 * @param childrenId    children of cover/model
 */
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

export type ChildDataOpts =Partial<ChildData>

export function createChildData(opts?:ChildDataOpts){
    const df:ChildData={
        id:'',
        type:'tool'
    }
    return createOpts(df,opts)
}