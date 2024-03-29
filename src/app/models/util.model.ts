import { createOpts } from "../utils/minitools";
import { CompanyType } from "./company.model";
import { UserRole } from "./user.model";

export type ColorType="primary"|"secondary"|"danger"|"light"|"tertiary"|"success"|"warning"|"medium"|"dark"
export type PageType=CompanyType|"All"
/** Page data */
export interface PageData{
    name:string;
    url:string;
    icon:string;
    iconColor?:ColorType;
    type?:PageType;
    roles?:UserRole[];      //allow role
}


/** Menu data */
export interface MenuData{
    name:string;           // for label & name
    icon?:string;           // icon
    iconColor?:ColorType;   // color of icon
    handler?:Function;      // handler
    image?:string;           // url of iamge
    role?:string;            //key
    note?:string;
    value?:string;          //for inputing data
}

export interface ButtonData{
    role:string;
    icon:string;
    name?:string;
    image?:string;
    handler?:Function;
    title?:string;
    iconColor?:ColorType
}

//** data */
export interface UrlData{
    url:string;
    thumbnail:string;
    caption:string;
}

//export type ModelDataOpts = Partial<ModelData>
export type UrlDataOpts = Partial<UrlData>

export function createUrlData(opts?:UrlDataOpts){
    const df:UrlData={
        url:'',
        thumbnail:'',
        caption:''
    }
    return createOpts(df,opts)
}