import { createOpts } from "../utils/minitools";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";

/**
 * Model management database
 * SaveInfo
 * ModelData
 */
export interface ModelData extends SaveInfo{
    id:string;                  // model ID
    name:string;                // name of tool
    group:string;               // Category
    images:string[];            // images
    compQty:number;             // quantity of component
    maintenance:number;         // day of maintenance
}

export interface ModelDataOpts extends SaveInfoOpts{
    id?:string;                  // model ID
    name?:string;                // name of tool
    group?:string;               // Category
    images?:string[];            // images
    compQty?:number;
    maintenance?:number;         // day of maintenance
}

/** make new modeldata from default & option */
export function createModelData(opts?:ModelDataOpts):ModelData{
    const now=new Date();
    const id=now.getTime().toString(36);
    const df:ModelData={
        ...createSaveInf({createAt:now.toISOString()}),
        id,
        name:'',
        group:'',
        maintenance:180,
        images:[],
        compQty:1
    }
    return createOpts(df,opts) 
}

/////////////// TOOLS ///////////////////////
export interface ToolData extends SaveInfo{
    id:string;                  // tool id
    startUse:string;              // start use this tool
    endUse:String;                // destroy date
    lastMaintenance:string;       // last maintenance
    status:ToolStatus;
    model:string;               // model id
    stay:string;                // where keep tool (stay alone)
    upperId:string;           // cover/box keep this tool
}


export interface ToolDataOpts extends SaveInfoOpts{
    id?:string;                  // tool id
    startUse?:string;              // start use this tool
    endUse?:String;                // destroy date
    lastMaintenance?:string;       // last maintenance
    status?:ToolStatus;
    model?:string; 
    stay?:string;               // where keep this tool
    upperId?:string;         // parents id (like book, cover)         
}



export function createToolData(opts?:ToolDataOpts):ToolData{
    const now=new Date();
    const id=now.getTime().toString(36);
    const df:ToolData={
        ...createSaveInf({createAt:now.toISOString()}),
        id,
        startUse:now.toISOString(),
        endUse:'',
        lastMaintenance:null,
        status:createToolStatus(),
        model:'',
        stay:'',
        upperId:''
    }
    return createOpts(df,opts) as ToolData;
}


export interface ToolStatus{
    visual:number;
    operation:number;
    function:number;
    compQty:number;
}

export interface ToolStatusOpts{
    visual?:number;
    operation?:number;
    function?:number;
    compQty?:number;
}

/** create new ToolStatus */
export function createToolStatus(opts?:ToolStatusOpts){
    const df:ToolStatus={
        visual:-1,      // not yet check
        operation:-1,   // not yet check
        function:-1,    // not yet check
        compQty:-1      // not yet check
    }
    return createOpts(df,opts)
}


const _DB_TOOLS="tools"
const _STORAGE_TOOLS="tools"

const _DB_MODELS="models"
const _STORAGE_MODELS="models"
