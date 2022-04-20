import { createOpts } from "../utils/minitools";
import { CompanyType } from "./company.model";

export type ColorType="primary"|"secondary"|"danger"|"light"|"tertiary"|"success"|"warning"|"medium"|"dark"
export type PageType=CompanyType|"All"
/** Page data */
export interface PageData{
    name:string;
    url:string;
    icon:string;
    iconColor?:ColorType;
    type?:PageType;
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
    caption:string;
}

export interface UrlDataOpts{
    url?:string;
    caption?:string;
}

export function createUrlData(opts?:UrlDataOpts){
    const df:UrlData={
        url:'',
        caption:''
    }
    return createOpts(df,opts)
}