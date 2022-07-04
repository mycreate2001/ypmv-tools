/** model display */
export const modelconfig={
    aspectRatio:4/3
}

export const configs={
    qrcode:"qrcode",
    toolstatus:"toolstatus",
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

// export const _DB_CONFIGS="configs"
export const _DB_CONFIGS='configs'