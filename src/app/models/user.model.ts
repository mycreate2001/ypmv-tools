import { createOpts } from "../utils/minitools";

export interface UserData{
    id:string;
    email:string;
    name:string;
    role:RoleType;
    image:string;
    createAt:string;
    lastLogin:string;
}

export interface UserDataOpts{
    id?:string;
    email?:string;
    name?:string;
    role?:RoleType;
    image?:string;
    createAt?:string;
    lastLogin?:string;
}

export function createUserData(opts?:UserDataOpts):UserData{
    const now=new Date()
    const df:UserData={
        id:'',
        email:'',
        name:'',
        role:'User',
        image:'',
        createAt:now.toISOString(),
        lastLogin:now.toISOString()
    }
    return createOpts(df,opts) as UserData
}
export declare type RoleType ="Administrator"|"User"


export const _DB_USERS="users"
export const _STORAGE_USERS="avatars"