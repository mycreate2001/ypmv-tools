import { createOpts } from "../utils/minitools";

/** save basic infor to database */
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