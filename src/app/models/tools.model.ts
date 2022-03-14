import { createOpts } from "../utils/minitools";

export interface SaveInfo{
    userId:string;
    createAt:string;
    comment:string;
}

export interface SaveInfoOpts{
    userId?:string;
    createAt?:string;
    comment?:string;
}

export function createSaveInf(opts?:SaveInfoOpts):SaveInfo{
    const df:SaveInfo={
        userId:'',
        createAt:new Date().toISOString(),
        comment:''
    }
    return createOpts(df,opts) as SaveInfo;
}

/**
 * Model management database
 * SaveInfo
 * ModelData
 */
export interface ModelData extends SaveInfo{
    id:string;                  // model ID
    name:string;                // name of tool
    group:string;               // Category
    maintenance:number;         // day of maintenance
    images:string[];            // images
    compQty:number;             // quantity of component
}

export interface ModelDataOpts extends SaveInfoOpts{
    id?:string;                  // model ID
    name?:string;                // name of tool
    group?:string;               // Category
    maintenance?:number;         // day of maintenance
    images?:string[];            // images
    compQty?:number;
}

/** make new modeldata from default & option */
export function createModelData(opts?:ModelDataOpts,debug:boolean=false):ModelData{
    const df:ModelData={
        ...createSaveInf(),
        id:'',
        name:'',
        group:'',
        maintenance:180,
        images:[],
        compQty:1
    }
    const model= createOpts(df,opts) as ModelData
    if(debug) console.log("\ncreateModelData",{opts,model});
    return model;
}


/**
 * Tool manage management
 * toolDataOpts
 */
export interface ToolDataOpts extends SaveInfoOpts{
    id?:string;                  // tool id
    startUse?:string;              // start use this tool
    endUse?:String;                // destroy date
    lastMaintenance?:string;       // last maintenance
    visual?:number;              // status vitual of tool, 0=OK, 1,2,3... NG
    operation?:number;           // status of tool operation, o= OK
    function?:number;            // status of tool function, 0=OK
    model?:string; 
    stay?:string;               // where keep this tool
    parentsId?:string;         // parents id (like book, cover)         
}

export interface ToolData extends SaveInfo{
    id:string;                  // tool id
    startUse:string;              // start use this tool
    endUse:String;                // destroy date
    lastMaintenance:string;       // last maintenance
    visual:number;              // status vitual of tool, 0=OK, 1,2,3... NG
    operation:number;           // status of tool operation, o= OK
    function:number;            // status of tool function, 0=OK
    model:string;               // model id
    stay:string;                // where keep tool (stay alone)
    parentsId:string;           // cover/box keep this tool
}


export function createToolData(opts?:ToolDataOpts):ToolData{
    const now=new Date();
    const id="TL="+now.getTime().toString(36);
    const df:ToolData={
        ...createSaveInf({createAt:now.toISOString()}),
        id,
        startUse:now.toISOString(),
        endUse:'',
        lastMaintenance:null,
        visual:0,
        operation:0,
        function:0,
        model:'',
        stay:'',
        parentsId:''
    }
    return createOpts(df,opts) as ToolData;
}
