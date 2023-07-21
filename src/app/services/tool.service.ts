import { Injectable } from "@angular/core";
import { FirestoreService } from "./firebase/firestore.service-2";
import { CoverData, _DB_COVERS } from "../models/cover.model";
import { ToolData, _DB_TOOLS } from "../models/tools.model";
import { ChildData } from "../models/basic.model";

@Injectable({
    providedIn:'root'
})

export class ToolService{
    constructor(private db:FirestoreService){}
    async getAddr(tool:CoverData|ToolData,opts?:Partial<getAddrOption>):Promise<string[]>{
        // error
        if(!tool ||!tool.id) return Promise.resolve([]);
        console.log("[getAddr] #1 verified success ")
        // already have
        if(tool.stay) return [tool.stay]
        console.log("[getAddr] #2 stay is empty ")
        //option
        const _opts:getAddrOption=Object.assign({},{covers:[],roots:[]},opts)
        console.log("[getAddr] #3 _opts",{_opts})
        //unknown (error data)
        const coverId:string=tool.upperId;
        console.log("[getAddr] #4 coverId",{coverId})
        if(!coverId) return [];//unknown

        //get upper
        const cover:CoverData=_opts.covers.find(c=>c.id===coverId)||await this.getCover(coverId);
        console.log("[getAddr] #5 cover ",{cover})
        if(!cover) return [];

        //
        console.log("[getAddr] #6")
        return [...await this.getAddr(cover,_opts),cover.name]
    }


    async getTool(tool:string|ToolData):Promise<ToolData|undefined>{
        if(!tool ) return;
        const id=typeof tool=='string'?tool:tool.id
        return this.db.get(_DB_TOOLS,id);
    }

    async getCover(cover:string|CoverData):Promise<CoverData|undefined>{
        if(!cover ) return;
        const id=typeof cover=='string'?cover:cover.id
        return this.db.get(_DB_COVERS,id);
    }
}


/////////// interface ///////////
export interface getAddrOption{
    covers:CoverData[];
    roots:string[];
}