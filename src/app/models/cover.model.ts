import { createOpts } from "../utils/minitools";
import { ChildData } from "./basic.model";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";
import { UrlData } from "./util.model";


export interface CoverData extends SaveInfo{
    id:string;                  // Id
    name:string;                // name
    group:string;               // group
    childrenId:ChildData[];       // tools/covers Id
    images:UrlData[];           // images of cover
    upperId:string;            // parents ID
    stay:string;                // where keep it when stay alone
}



export interface CoverDataOpts extends SaveInfoOpts{
    id?:string;                  // Id
    name?:string;                // name
    group?:string;               // group
    childrenId?:ChildData[];       // tools/covers Id
    images?:UrlData[];           // images of cover
    upperId?:string;            // parents ID
    stay?:string;                // where keep it when stay alone
}

export function createCoverData(opts?:CoverDataOpts):CoverData{
    const now=new Date();
    const id:string=now.getTime().toString(26);
    const createAt:string=now.toISOString();
    const df:CoverData={
        ...createSaveInf({createAt}),
        id,                  // Id
        name:'',                // name
        group:'',               // group
        childrenId:[],          // tools/covers Id
        images:[],              // images of cover
        upperId:'',             // parents ID
        stay:'',                // where keep it when stay alone
    }
    return createOpts(df,opts) as CoverData;
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


// export const _DB_COVERS="covers"
// export const _STORAGE_COVERS="covers"
export const _DB_COVERS="covers"
export const _STORAGE_COVERS="covers"