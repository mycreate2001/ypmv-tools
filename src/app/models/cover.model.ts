import { createOpts } from "../utils/minitools";
import { ChildData } from "./basic.model";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";


export interface CoverData extends SaveInfo{
    id:string;                  // Id
    name:string;                // name
    group:string;               // group
    childrenId:ChildData[];       // tools/covers Id
    images:string[];           // images of cover
    upperId:string;            // parents ID
    stay:string;                // where keep it when stay alone
    note:string;
}



export interface CoverDataOpts extends SaveInfoOpts{
    id?:string;                  // Id
    name?:string;                // name
    group?:string;               // group
    childrenId?:ChildData[];       // tools/covers Id
    images?:string[];           // images of cover
    upperId?:string;            // parents ID
    stay?:string;                // where keep it when stay alone
    note?:string;
}

export function createCoverData(opts?:CoverDataOpts):CoverData{
    const now=new Date();
    const id:string=now.getTime().toString(36);
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
        note:''
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
export function getCovers(coversId:string|string[],allCovers:CoverData[],selectedCovers:CoverData[]):CoverData[]{
    [].concat(coversId).forEach(coverId=>{
        if(selectedCovers.find(c=>c.id==coverId)) return;
        const cover=allCovers.find(c=>c.id==coverId);
        if(!cover) {console.log("### ERROR[1]: Cover '%s' not exist",coverId);return}
        //add
        selectedCovers.push(cover);
        //check children
        const childrenId=cover.childrenId.filter(c=>c.type=='cover').map(x=>x.id)
        if(childrenId.length)  selectedCovers=getCovers(childrenId,allCovers,selectedCovers)
    })
    return selectedCovers;
}


export const _DB_COVERS="covers"
export const _STORAGE_COVERS="covers"