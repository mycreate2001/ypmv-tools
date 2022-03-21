import { createOpts } from "../utils/minitools";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";


export interface CoverData extends SaveInfo{
    id:string;                  // Id
    name:string;                // name
    group:string;               // group
    childrenId:string[];       // tools/covers Id
    images:string[];           // images of cover
    upperId:string;            // parents ID
    stay:string;                // where keep it when stay alone
}

export interface CoverDataOpts extends SaveInfoOpts{
    id?:string;                  // Id
    name?:string;                // name
    group?:string;               // group
    childrenId?:string[];       // tools/covers Id
    images?:string[];           // images of cover
    upperId?:string;            // parents ID
    stay?:string;                // where keep it when stay alone
}

export function createCoverData(opts?:CoverDataOpts):CoverData{
    const now=new Date();
    const id:string=now.getTime().toString(36);
    const createAt:string=now.toISOString();
    const df:CoverData={
        ...createSaveInf({createAt}),
        id:'',                  // Id
        name:'',                // name
        group:'',               // group
        childrenId:[],          // tools/covers Id
        images:[],              // images of cover
        upperId:'',             // parents ID
        stay:'',                // where keep it when stay alone
    }
    return createOpts(df,opts) as CoverData;
}