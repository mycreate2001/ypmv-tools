import { createOpts } from "../utils/minitools";
export type UserDataRole="admin"|"standard"|"guest"
export interface UserData{
    id:string;
    email:string;
    name:string;
    role:UserDataRole;
    image:string;
    createAt:string;
    lastLogin:string;
}

export interface UserDataOpts{
    id?:string;
    email?:string;
    name?:string;
    role?:UserDataRole;
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
        role:'standard',
        image:'',
        createAt:now.toISOString(),
        lastLogin:now.toISOString()
    }
    return createOpts(df,opts) as UserData
}

export const _DB_USERS="users"
export const _STORAGE_USERS="avatars"