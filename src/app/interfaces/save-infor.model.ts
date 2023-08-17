import { UpdateInf } from "../utils/data.handle";
import { createOpts } from "../utils/minitools";
import { BasicItem, createBasicItem } from "./basic-item.interface";

export interface SaveInfo{
    user:BasicItem
    createAt:string;
    comment:string;
    lastUpdate:string;
    histories:SelfHistory[];
    destroyDate:string;
}

export function createSaveInfor(opts?:Partial<SaveInfo>):SaveInfo{
    const now=new Date().toISOString();
    const df:SaveInfo={
        user:createBasicItem({...opts.user,type:'user'}),
        createAt:now,
        comment:'',
        lastUpdate:now,
        histories:[],
        destroyDate:''
    }

    return createOpts(df,opts)
}

export interface SelfHistory{
    userId:string;          // user who edit database
    createAt:string;        // create date
    updateList:UpdateInf[];
}

export type SelfHistoryOpts=Partial<SelfHistory>

export function createSelfHistory(opts:SelfHistoryOpts={}){
    const df:SelfHistory={
        userId:'',
        updateList:[],
        createAt:new Date().toISOString()
    }
    return Object.assign(df,opts)
}

export type SaveInfoOpts=Partial<SaveInfo>
