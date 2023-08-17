import { createOpts, uuid } from "../utils/minitools";
import { UrlData, createUrlData } from "./urldata.interface";

export declare type CompanyType="Yamaha Branch"|"Agency"|"Customer"
export interface CompanyData{
    id:string;
    name:string;
    address:string;
    phone:string;
    image:UrlData;
    type:CompanyType;
    createAt:string;
    email:string;
}



export function createCompanyData(opts?:Partial<CompanyData>):CompanyData{
    const now=new Date();
    const id="CPN"+uuid()
    const df:CompanyData={
        id,
        name:'',
        address:'',
        phone:'',
        image:createUrlData(),
        type:'Customer',
        createAt:now.toISOString(),
        email:''
    }
    return createOpts(df,opts) as CompanyData
}

export const _STORAGE_COMPANY="companies";
export const _DB_COMPANY="companies"
