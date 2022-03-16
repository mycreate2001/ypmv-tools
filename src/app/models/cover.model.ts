import { createOpts } from "../utils/minitools";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./tools.model";

export interface CoverData extends SaveInfo{
    id:string;              //
    name:string;
    toolsId:string[];       // tool ID
    images:string[];        // images of cover
    parentsId:string;       // parents ID
    stay:string;            // where keep it when stay alone
}

export interface CoverDataOpts extends SaveInfoOpts{
    id?:string;              //
    name?:string;
    toolsId?:string[];       // tool ID
    images?:string[];        // images of cover
    parentsId?:string;       // parents ID
    stay?:string;            // where keep it when stay alone
}

export function createCoverData(opts?:CoverDataOpts):CoverData{
    const now=new Date();
    const id:string=now.getTime().toString(36);
    const createAt:string=now.toISOString();
    const df:CoverData={
        ...createSaveInf({createAt}),
        id,
        name:"",
        toolsId:[],       // tool ID
        images:[],        // images of cover
        parentsId:"",      // parents ID
        stay:""            // where keep it when stay alone
    }
    return createOpts(df,opts) as CoverData;
}