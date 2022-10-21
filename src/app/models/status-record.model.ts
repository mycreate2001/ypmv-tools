import { createOpts } from "../utils/minitools";
import { BasicData, ChildData  } from "./basic.model";
import { BasicDataExt } from "./order.model";
import { createSaveInf, SaveInfo } from "./save-infor.model";
import { UrlData } from "./util.model";

export interface StatusRecord extends SaveInfo{
    /**
     * SaveInfo
     * - createAt       // create date
     * - userId         // who make this record
     * - histories      // Selft histories
     * - comment
     * - lastupdate     // last revise
     */
    id:string;
    ids:string[];       // id of tool/cover = <cover/tool>-<id>
    data:ToolStatus[];

}


/**
 * get update of ids
 * @param record statusrecord need to update ids
 * @returns restusRecord get update ids
 */
export function UpdateStatusRecordIDs(record:StatusRecord):StatusRecord{
    const ids=record.data.map(item=>`${item.type}-${item.id}`);
    return {...record,ids}
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

export function createStatusRecord(opts:Partial<StatusRecord>={}):StatusRecord{
    const now=new Date();
    const id=now.getTime().toString(36)+'-'+Math.random().toString(36).substring(2,10);
    const df:StatusRecord={
        id,
        ids:[],             // <cover/tool>-<id>
        data:[],
        ...createSaveInf({createAt:now.toISOString(),...opts})

    }
    return createOpts(df,opts);
}

export const _STATUS_NOTYET={value:1,key:'Not yet'}
export const _STATUS_OK={key:'ok',value:0}
export const _STATUS_NG={key:'NG',value:2}

export const _DB_STATUS_RECORD='histories';
export const _STORAGE_STATUS_RECORD='histories'