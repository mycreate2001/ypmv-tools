export class ModelData{
    id:string='';
    name:string='';
    group:string='';
    maintenance:number=0;         // day of maintenance
    image:string='';               // image
    constructor(opts?:ModelData){
        if(!opts) return;
        Object.keys(this).forEach(key=>{
            this[key]=opts[key]||this[key]
        })
    }
}

export interface ToolDataOptions{
    id?:string;                  // tool id
    startUse?:Date;              // start use this tool
    endUse?:String;                // destroy date
    lastMaintenance?:Date;       // last maintenance
    vitual?:number;              // status vitual of tool, 0=OK, 1,2,3... NG
    operation?:number;           // status of tool operation, o= OK
    function?:number;            // status of tool function, 0=OK
    model?:string;           
}

export class ToolData{
    id:string='';                  // tool id
    startUse:Date=new Date();              // start use this tool
    endUse:String='';                // destroy date
    lastMaintenance:Date;       // last maintenance
    vitual:number=0;              // status vitual of tool, 0=OK, 1,2,3... NG
    operation:number=0;           // status of tool operation, o= OK
    function:number=0;            // status of tool function, 0=OK
    model:string='';                   // model id
    constructor(opts?:ToolDataOptions){
        if(!opts) return;
        Object.keys(opts).forEach(key=>{
            this[key]=opts[key]
        })
    }
}

export interface BackupData{
    userId:string;
    date:Date;
    comment:string;
}

/** backup tool data */
export class ToolSave{
    tool:ToolData=new ToolData();
    saveInfo:BackupData={
        date:new Date(),
        comment:'',
        userId:''
    }
    constructor(opts?:ToolSave){
        if(!opts ||!opts.saveInfo) return
        if(opts.tool){
            Object.keys(this.tool).forEach(key=>{
                this.tool[key]=opts.tool[key]||this.tool[key]
            })
        }
        if(opts.saveInfo){
            Object.keys(this.saveInfo).forEach(key=>{
                this.saveInfo[key]=opts.saveInfo[key]||this.saveInfo[key];
            })
        }
        
    }
}
