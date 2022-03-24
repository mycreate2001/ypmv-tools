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
}

export interface SaveInfoOpts{
    userId?:string;
    createAt?:string;
    comment?:string;
    lastUpdate?:string;
}

export function createSaveInf(opts?:SaveInfoOpts):SaveInfo{
    const now=new Date().toISOString();
    const df:SaveInfo={
        userId:'',
        createAt:now,
        comment:'',
        lastUpdate:now
    }
    return createOpts(df,opts) as SaveInfo;
}