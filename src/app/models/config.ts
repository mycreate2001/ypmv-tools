/** model display */
export const modelconfig={
    aspectRatio:4/3
}

export const configs={
    qrcode:['list'],
    toolstatus:['visual','operation','function','quantity']
}

export const configList=Object.keys(configs)
export type ConfigId=keyof typeof configs

// export const _DB_CONFIGS="configs"
export const _DB_CONFIGS='configs'