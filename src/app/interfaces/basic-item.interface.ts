import { UrlData } from "./util.model";

export interface BasicItem{
    id:string;          // id of item
    name:string;        // name of item
    type:string;        // type, example 'cover','tool','model',...
    image:UrlData;     // images of item
}