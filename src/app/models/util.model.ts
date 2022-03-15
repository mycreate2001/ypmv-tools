export type ColorType="primary"|"secondary"|"danger"|"light"|"tertiary"|"success"|"warning"|"medium"|"dark"

export interface PageData{
    name:string;
    url:string;
    icon:string;
    iconColor?:ColorType;
}

export interface MenuData{
    name:string;
    icon?:string;
    iconColor?:ColorType;
    handler?:Function;
    role?:string;
}