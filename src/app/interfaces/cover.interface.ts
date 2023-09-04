import { createOpts, uuid } from "../utils/minitools";
import { BasicItem } from "./basic-item.interface";
import { ChildData } from "./basic.model";
import { SaveInfo, createSaveInfor } from "./save-infor.model";
import { UrlData } from "./urldata.interface";


export interface CoverData extends SaveInfo{
    id:string;                  // Id
    name:string;                // name
    group:string;               // group
    childrenId:ChildData[];       // tools/covers Id
    images:UrlData[];           // images of cover
    upper:BasicItem;            // parents ID
    stay:BasicItem;                // where keep it when stay alone
    statusList:string[];
    targetMch:BasicItem[];
}

export function createCoverData(opts?:Partial<CoverData>):CoverData{
    const df:CoverData={
        ...createSaveInfor(opts),
        id:'cv-'+uuid(),
        name:'',
        group:'',
        childrenId:[],
        images:[],
        upper:null,
        stay:null,
        statusList:[],
        targetMch:[]
    }
    return createOpts(df,opts)
}
export interface CoverDataExt extends CoverData{
    upper:BasicItem;
}


/**
 * get all cover from main cover
 * @param coversId cover id need check & add
 * @param allCovers all covers db
 * @param selectedCovers covers already select
 * @returns 
 */
export function getCovers(coversId:ChildData[],allCovers:CoverData[],selectedCovers:CoverData[]):CoverData[]{
    let list:ChildData[]=[];
    coversId.forEach(child=>{
        if(child.type!='cover') return;
        if(selectedCovers.find(c=>c.id==child.id)) return;
        const cover=allCovers.find(c=>c.id==child.id)
        if(!cover) return;
        selectedCovers.push(cover);
        list=list.concat(cover.childrenId.filter(x=>x.type=='cover'));
    })
    if(list.length) selectedCovers=getCovers(list,allCovers,selectedCovers)
    return selectedCovers;
}

export const _DB_COVERS="covers"
export const _STORAGE_COVERS="covers"