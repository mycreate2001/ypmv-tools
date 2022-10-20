import { createOpts } from "../utils/minitools";
import { createSaveInf, SaveInfo } from "./save-infor.model";
import { StatusInf } from "./status-record.model";
import { UrlData } from "./util.model";

/**
 * Model management database
 * SaveInfo
 * ModelData
 */
export interface ModelData extends SaveInfo{
    id:string;                  // model ID
    name:string;                // name of tool
    group:string;               // Category
    images:UrlData[];            // images
    compQty:number;             // quantity of component
    maintenance:number;         // day of maintenance
    note:string;
    companyId:string;
    statusList:string[];
}

export type ModelDataOpts = Partial<ModelData>

/** make new modeldata from default & option */
export function createModelData(opts?:ModelDataOpts):ModelData{
    const now=new Date();
    const id=now.getTime().toString(36)+Math.random().toString(36).substring(2,10);
    const df:ModelData={
        ...createSaveInf({createAt:now.toISOString(),...opts}),
        id,
        name:'',
        group:'',
        maintenance:180,
        images:[],
        compQty:1,
        note:'',
        companyId:'',
        statusList:['visual','operation']
    }
    return createOpts(df,opts) 
}

/////////////// TOOLS ///////////////////////
export interface ToolData extends SaveInfo{
    id:string;                    // tool id
    startUse:string;              // start use this tool
    endUse:String;                // destroy date
    lastMaintenance:string;       // last maintenance
    status:StatusInf[];          // status
    model:string;               // model id
    stay:string;                // where keep tool (stay alone)
    upperId:string;             // cover/box keep this tool
    companyId:string;           // owner
}


export type ToolDataOpts = Partial<ToolData>

export const StatusList=['operation','visual','function','quantity'] as const

export function createToolData(opts?:ToolDataOpts):ToolData{
    const now=new Date();
    const id=now.getTime().toString(36)+Math.random().toString(36).substring(2,10);
    const createAt:string=now.toISOString()
    const df:ToolData={
        ...createSaveInf({createAt,...opts}),
        id,
        startUse:createAt,
        endUse:'',
        lastMaintenance:null,
        status:StatusList.map(key=>{return {key,value:-1}}),
        model:'',
        stay:'',
        upperId:'',
        companyId:''
    }
    return createOpts(df,opts) as ToolData;
}


// export interface ToolStatus{
//     visual:number;
//     operation:number;
//     function:number;
//     quantity:number;
// }

// export type ToolStatusOpts =Partial<ToolData>

// /** create new ToolStatus */
// export function createToolStatus(opts?:ToolStatusOpts){
//     const df:ToolStatus={
//         visual:1,       // not yet check
//         operation:1,    // not yet check
//         function:1,     // not yet check
//         quantity:1      // not yet check
//     }
//     return createOpts(df,opts)
// }

// /** status list */
// export const statusList={
//     cover:['visual'],
//     tool:Object.keys(createToolStatus())
// }


export const _DB_TOOLS="tools"
export const _STORAGE_TOOLS="tools"

export const _DB_MODELS="models"
export const _STORAGE_MODELS="models"
