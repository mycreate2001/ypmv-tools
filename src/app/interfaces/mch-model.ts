import { createOpts, uuid } from "../utils/minitools";
import { SaveInfo, createSaveInfor } from "./save-infor.model";
import { UrlData } from "./urldata.interface";

export interface MchModel extends SaveInfo{
    id:string;
    name:string;            // name of model
    gen:number;             // generation
    images:UrlData[];
    group:string;
}

export function createMchModel(model?:Partial<MchModel>):MchModel{
    const df:MchModel={
        ...createSaveInfor(model),
        id:_PRE_MCH_MODEL+"-"+uuid(),
        name:'',
        gen:1,
        images:[],
        group:''
    }
    return createOpts(df,model?model:{})
}

export const _DB_MCH_MODEL="mch_models"
export const _STORAGE_MCH_MODEL="mch_models"
export const _PRE_MCH_MODEL='mmd'