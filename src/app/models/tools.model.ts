export interface ModelData{
    id:string;
    name:string;
    group:string;
    maintenance:number;         // day of maintenance
    image:string;               // image
    qty?:number;
}

export interface ToolData{
    id:string;                  // tool id
    startUse:Date;              // start use this tool
    endUse:String;                // destroy date
    lastMaintenance:Date;       // last maintenance
    vitual:number;              // status vitual of tool, 0=OK, 1,2,3... NG
    operation:number;           // status of tool operation, o= OK
    function:number;            // status of tool function, 0=OK
    model:string;                   // model id
    name?:string;                   // model.name
    group?:string;                  // model.group
    image?:string;                  // model.image
    maintenance?:number ;           // model.maintenance/
}