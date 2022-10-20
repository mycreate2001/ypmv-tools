/** model display */
export const modelconfig={
    aspectRatio:4/3
}

export const configs={
    qrcode:"qrcode",
    toolstatus:"toolproperty",
    groups:"groups",
    user:"user"
}

export interface UserConfig{
    role:string[];
}

export interface GroupConfig{
    list:string[];
}

export interface QRcodeConfig{
    list:string[];
}

export const configList=Object.keys(configs)
export type ConfigId=keyof typeof configs
export const _CONFIG_STATUS_ID='status'
// export const _DB_CONFIGS="configs"
export const _DB_CONFIGS='configs'

export interface StatusConfig{
    key:string;
    order:number;
    list:string[];
}

export interface ToolStatusConfig{
    statuslist:StatusConfig[];
}