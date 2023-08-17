import { createOpts, uuid } from "../utils/minitools";
import { BasicData, ChildData  } from "./basic.model";
import { BasicDataExt } from "./order.model";
import { SaveInfo, createSaveInfor } from "./save-infor.model";
import { UrlData } from "./urldata.interface";

export interface StatusRecord extends SaveInfo{
    id:string;
    ids:string[];       // id of tool/cover = <cover/tool>-<id>
    data:ToolStatus[];
    
}

// constructor(statusRecord?:Partial<StatusRecord>){
//     super();
//     Object.assign(this,statusRecord);
//     this.updateIds();
// }

// updateIds(){
//     this.ids=this.data.map(item=>`${item.type}-${item.id}`);
// }
export function createStatusRecord(opts?:Partial<StatusRecord>):StatusRecord{
    const df:StatusRecord={
        ...createSaveInfor(opts),
        id:'his-'+uuid(),
        ids:[],
        data:[],
    }
    const out= createOpts(df,opts);
    return updateStatusRecordIds(out)
}

export function updateStatusRecordIds(status:StatusRecord):StatusRecord{
    const ids=status.data.map(item=>`${item.type}-${item.id}`)
    return {...status,ids}
}



export interface ToolStatus extends ChildData{
    // id, type:tool/box
    images:UrlData[];       // images of tool/box
    status:StatusInf[];     // status information
    comment:string;
}

export type ToolStatusOpts=Partial<ToolStatus>
export function createToolStatus(opts:ToolStatusOpts={}):ToolStatus{
    const df:ToolStatus={
        id:'',
        type:'tool',
        status:[],
        images:[],
        comment:''
    }

    return createOpts(df,opts)
}

export function createStatusInfor(tool:BasicData|BasicDataExt|string[]){
    let list:string[]=[]
    if(Array.isArray(tool)) list=tool;
    else list=tool.statusList
    return list.map(key=>{
        const stt:StatusInf={key,value:_STATUS_NOTYET.value}
        return stt;
    })
}

export interface StatusInf{
    key:string;
    value:number;
}

// export function createStatusRecord(opts:Partial<StatusRecord>={}):StatusRecord{
//     const now=new Date();
//     const df:StatusRecord={
//         id:'',
//         ids:[],             // <cover/tool>-<id>
//         data:[],
//         ...new SaveInfo({createAt:now.toISOString(),...opts})

//     }
//     const ids:string[]=(opts && opts.data)?opts.data.map(st=>`${st.type}-${st.id}`):[]
//     return createOpts(df,opts,{ids});
// }

export const _STATUS_NOTYET={value:1,key:'Not yet'}
export const _STATUS_OK={key:'ok',value:0}
export const _STATUS_NG={key:'NG',value:2}

export const _DB_STATUS_RECORD='histories';
export const _STORAGE_STATUS_RECORD='histories'