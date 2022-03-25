import { createOpts } from "../utils/minitools";

export declare type CompanyType="Yamaha Branch"|"Agency"|"Customer"
export interface CompanyData{
    id:string;
    name:string;
    address:string;
    phone:string;
    image:string;
    type:CompanyType;
    createAt:string;
    email:string;
}

export interface CompanyDataOpts{
    id?:string;
    name?:string;
    address?:string;
    phone?:string;
    image:string;
    type?:CompanyType;
    createAt?:string;
    email?:string;
}

export function createCompanyData(opts?:CompanyDataOpts):CompanyData{
    const now=new Date();
    const id="CPN$"+now.getTime().toString(36).toUpperCase();
    const df:CompanyData={
        id,
        name:'',
        address:'',
        phone:'',
        image:'',
        type:'Customer',
        createAt:now.toISOString(),
        email:''
    }
    return createOpts(df,opts) as CompanyData
}

export const _STORAGE_COMPANY="companies";
export const _DB_COMPANY="companies"
