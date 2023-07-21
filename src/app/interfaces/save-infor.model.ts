import { UpdateInf } from "../utils/data.handle";
import { createOpts } from "../utils/minitools";

/** save basic infor to database 
    @param userId   create By who;
    @param createAt when create;
    @param comment  comment
    @param lastUpdate last time revise
*/
export interface SaveInfo{
    userId:string;
    createAt:string;
    comment:string;
    lastUpdate:string;
    histories:SelfHistory[];
    destroyDate:string;
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

export function createSaveInf(opts?:SaveInfoOpts):SaveInfo{
    const now=new Date().toISOString();
    const df:SaveInfo={
        userId:'',
        createAt:now,
        comment:'',
        lastUpdate:now,
        histories:[],
        destroyDate:''
    }
    return Object.assign(df,opts);
}