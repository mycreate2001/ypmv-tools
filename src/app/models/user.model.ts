import { createOpts } from "../utils/minitools";
export const UserRoleList=["admin","manager","leader","standard"] as const
export type UserRole= typeof  UserRoleList[number]
export interface UserData{
    id:string;
    email:string;
    name:string;
    role:UserRole;
    image:string;
    createAt:string;
    lastLogin:string;
    companyId:string;
}

export type UserDataOpts=Partial<UserData>

export function createUserData(opts?:UserDataOpts):UserData{
    const now=new Date()
    const df:UserData={
        id:'',
        email:'',
        name:'',
        role:'standard',
        image:'',
        companyId:'',
        createAt:now.toISOString(),
        lastLogin:now.toISOString()
    }
    return createOpts(df,opts) as UserData
}

export const _DB_USERS="users"
export const _STORAGE_USERS="avatars"