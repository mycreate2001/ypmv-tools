import { createOpts } from "../utils/minitools";

export type ColorType="primary"|"secondary"|"danger"|"light"|"tertiary"|"success"|"warning"|"medium"|"dark"

/** Page data */
export interface PageData{
    name:string;
    url:string;
    icon:string;
    iconColor?:ColorType;
}


/** Menu data */
export interface MenuData{
    role:string;            //key
    name?:string;           // for label & name
    icon?:string;           // icon
    iconColor?:ColorType;   // color of icon
    handler?:Function;      // handler
    image:string;           // url of iamge
}

//** data */
export interface ImageData{
    url:string;
    caption:string;
}

export interface ImageDataOpts{
    url?:string;
    caption?:string;
}

export function createImageData(opts?:ImageDataOpts){
    const df:ImageData={
        url:'',
        caption:''
    }
    return createOpts(df,opts)
}