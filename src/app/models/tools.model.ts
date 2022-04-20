import { createOpts } from "../utils/minitools";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";
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
}

export interface ModelDataOpts extends SaveInfoOpts{
    id?:string;                  // model ID
    name?:string;                // name of tool
    group?:string;               // Category
    images?:UrlData[];            // images
    compQty?:number;
    maintenance?:number;         // day of maintenance
    note?:string;
    companyId?:string;
}

/** make new modeldata from default & option */
export function createModelData(opts?:ModelDataOpts):ModelData{
    const now=new Date();
    const id=now.getTime().toString(26);
    const df:ModelData={
        ...createSaveInf({createAt:now.toISOString()}),
        id,
        name:'',
        group:'',
        maintenance:180,
        images:[],
        compQty:1,
        note:'',
        companyId:''
    }
    return createOpts(df,opts) 
}

/////////////// TOOLS ///////////////////////
export interface ToolData extends SaveInfo{
    id:string;                    // tool id
    startUse:string;              // start use this tool
    endUse:String;                // destroy date
    lastMaintenance:string;       // last maintenance
    status:ToolStatus;          // status
    model:string;               // model id
    stay:string;                // where keep tool (stay alone)
    upperId:string;             // cover/box keep this tool
    companyId:string;           // owner
}


export interface ToolDataOpts extends SaveInfoOpts{
    id?:string;                  // tool id
    startUse?:string;              // start use this tool
    endUse?:String;                // destroy date
    lastMaintenance?:string;       // last maintenance
    status?:ToolStatus;
    model?:string; 
    stay?:string;               // where keep this tool
    upperId?:string;            // parents id (like book, cover)  
    companyId?:string;       
}



export function createToolData(opts?:ToolDataOpts):ToolData{
    const now=new Date();
    const id=now.getTime().toString(26);
    const df:ToolData={
        ...createSaveInf({createAt:now.toISOString()}),
        id,
        startUse:now.toISOString(),
        endUse:'',
        lastMaintenance:null,
        status:createToolStatus(),
        model:'',
        stay:'',
        upperId:'',
        companyId:''
    }
    return createOpts(df,opts) as ToolData;
}


export interface ToolStatus{
    visual:number;
    operation:number;
    function:number;
    quantity:number;
}

export interface ToolStatusOpts{
    visual?:number;
    operation?:number;
    function?:number;
    quantity?:number;
}

/** create new ToolStatus */
export function createToolStatus(opts?:ToolStatusOpts){
    const df:ToolStatus={
        visual:1,      // not yet check
        operation:1,   // not yet check
        function:1,    // not yet check
        quantity:1      // not yet check
    }
    return createOpts(df,opts)
}

/** status list */
export const statusList={
    cover:['visual'],
    tool:Object.keys(createToolStatus())
}


export const _DB_TOOLS="tools"
export const _STORAGE_TOOLS="tools"

export const _DB_MODELS="models"
export const _STORAGE_MODELS="models"
