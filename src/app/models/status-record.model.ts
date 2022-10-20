import { createOpts } from "../utils/minitools";
import { ChildData } from "./basic.model";
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
}

export type ToolStatusOpts=Partial<ToolStatus>
export function createToolStatus(opts:ToolStatusOpts={}):ToolStatus{
    const df:ToolStatus={
        id:'',
        type:'tool',
        status:[],
        images:[]
    }

    return createOpts(df,opts)
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
        ids:[],
        data:[],
        ...createSaveInf({createAt:now.toISOString(),...opts})

    }
    return createOpts(df,opts);
}

export const _STATUS_NOTYET={value:-1,key:'Not yet'}
export const _STATUS_OK={key:'ok',value:0}
export const _STATUS_NG={key:'NG'}

export const _DB_STATUS_RECORD='histories';
export const _STORAGE_STATUS_RECORD='histories'