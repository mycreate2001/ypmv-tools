import { createOpts } from "../utils/minitools";
import { BasicItem } from "./basic-item.interface";
import { UrlData, createUrlData } from "./urldata.interface";
export const UserRoleList=["admin","manager","leader","standard"] as const
export type UserRole= typeof  UserRoleList[number]
export interface UserData{
    id:string;
    email:string;
    name:string;
    role:UserRole;
    image:UrlData;
    createAt:string;
    lastLogin:string;
    company:BasicItem;
    deactive:boolean;
}

export type UserDataOpts=Partial<UserData>

export function createUserData(opts?:UserDataOpts):UserData{
    const now=new Date()
    const df:UserData={
        id:'',
        email:'',
        name:'',
        role:'standard',
        image:createUrlData(),
        company:opts.company||null,
        createAt:now.toISOString(),
        lastLogin:now.toISOString(),
        deactive:false
    }
    return createOpts(df,opts) as UserData
}

export const _DB_USERS="users"
export const _STORAGE_USERS="avatars"