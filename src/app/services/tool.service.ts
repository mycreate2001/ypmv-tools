import { Injectable } from "@angular/core";
import { FirestoreService } from "./firebase/firestore.service-2";
import { CoverData, _DB_COVERS } from "../interfaces/cover.interface";
import { ToolData, _DB_TOOLS } from "../interfaces/tools.model";
import { CompanyData, _DB_COMPANY } from "../interfaces/company.model";
import { BasicItem } from "../interfaces/basic-item.interface";
// import { ChildData } from "../interfaces/basic.model";

@Injectable({
    providedIn:'root'
})

export class ToolService{
    constructor(private db:FirestoreService){}
    async getAddr(tool:CoverData|ToolData,opts?:Partial<getAddrOption>):Promise<string[]>{
        //1. check data
        if(!tool||!tool.id) return [];//tool error
        //2. correct data
        const _opts:getAddrOption=Object.assign({},{covers:[],roots:[]},opts)
        //3.get address
        //3.1 upper data (basci Item)
        let upper:BasicItem=tool.upper;
        //3.2 upper data is empty -->finish
        if(!upper) return []
        //3.2 getting coverdata
        const coverId=typeof upper=='string'?upper:upper.id
        let cover=_opts.covers.find(c=>c.id===coverId);
        // 3.2.1 if not available in options
        if(!cover){
            cover=await this.db.get(_DB_COVERS,coverId);
            //3.2.1.1 not available in db --> empty
            if(!cover) return [];
            _opts.covers.push(cover);//add to _opts
        }

        //3.3 refresh new
        return [..._opts.roots,cover.name,...await this.getAddr(cover,_opts)]

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

    async getCompany(id:string):Promise<CompanyData|undefined>{
        if(!id) return;//error
        return this.db.get(_DB_COMPANY,id);
    }
}


/////////// interface ///////////
export interface getAddrOption{
    covers:CoverData[];
    roots:string[];
}