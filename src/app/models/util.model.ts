export type ColorType="primary"|"secondary"|"danger"|"light"|"tertiary"|"success"|"warning"|"medium"|"dark"

export interface PageData{
    name:string;
    url:string;
    icon:string;
    iconColor?:ColorType;
}