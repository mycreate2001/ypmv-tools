export interface CodeFormatData{
    id:string;
    order:number;
    name:string;
    prefix:string;
    subfix:string;
    delimiter:string;
    countData:number;
    length:number;
    extractDatas:ExtractData[];
}

export interface CodeFormatDataOpts{
    id?:string;
    order?:number;
    name?:string;
    prefix?:string;
    subfix?:string;
    delimiter?:string;
    countData?:number;
    length?:number;
    extractDatas?:ExtractData[];
}

export function createFormatData(opts?:CodeFormatDataOpts):CodeFormatData{
    const df:CodeFormatData={
        id:'',
        order:0,
        name:'',
        prefix:'',
        subfix:'',
        delimiter:'',
        countData:0,
        length:0,
        extractDatas:[]
    }

    if(opts){
        Object.keys(df).forEach(key=>{
            if(opts[key]!=undefined) df[key]=df[key]
        })
    }
    
    return df;
}

export interface ExtractDataOpts{
    name?:string;
    no?:number;
    start?:number;
    finish?:number;
    ignores?:string;
    delimiter?:string;
}

export interface ExtractData{
    name:string;
    no:number;
    start:number;
    finish:number;
    ignores:string;
    delimiter:string;
}

export function createExtractData(opts?:ExtractDataOpts):ExtractData{
    const df={
        name:'',
        no:0,
        start:1,
        finish:0,
        ignores:'',
        delimiter:''
    }
    if(opts){
        Object.keys(df).forEach(key=>{
            if(opts[key]!=undefined) df[key]=opts[key]
        })
    }
    return df;
}

/**
 * analysis code
 * @param code testing code
 * @param formats format of code
 * @returns result of analysis
 */
export function analysisCode(code:string,formats:CodeFormatData|CodeFormatData[]):undefined|Object{
    const out:any={};
    // console.log({code,formats})
    if(!code||!formats) return;
    const result= [].concat(formats).some(f=>{
        //checking condition
        if(f.length!=0 && code.length!=f.length) {
            console.log("case#1");
            return false ;
        }

        if(f.prefix && !code.startsWith(f.prefix)) {
            console.log("case#2");return false;
        }

        if(f.subfix && !code.endsWith(f.subfix)) {
            console.log('case #3');
            return false;
        }
        if(f.delimiter ) {
            const arrs=code.split(f.delimiter);
            if(arrs.length<=1) {
                console.log("case #4")
                return false;
            }
            if(f.countData && arrs.length!=f.countData){
                console.log('case #5');
                return false;
            }
        }

        //extract information
        const extractDatas=f.extractDatas;
        f.extractDatas.forEach(e=>{
            let data="";
            if(!e.no) data=code;
            else data=code.split(f.delimiter)[e.no-1];
            if(!data) return;
            if(e.finish) data=data.substring(e.start-1,e.finish-1)
            else data=data.substring(e.start-1);
            (e.ignores+"").split(e.delimiter) .forEach(ignore=>{
                data=data.replace(new RegExp(ignore,'g'),"")
            })
            out[e.name]=data;
        })
        console.log("case 6:OK, out:",out);
        return true;
    })
    if(!result) return;
    return out;
}

export function checkCode(code:string, format:CodeFormatData){
    const out:any={};
    out.length=(format.length && code.length!=format.length)?code.length:"";
    out.prefix=(format.prefix && !code.startsWith(format.prefix))?
        code.substring(0,format.prefix.length):"";
    out.subfix=(format.subfix && !code.endsWith(format.subfix))?
        code.substring(code.length-format.subfix.length):""
    out.delimiter=code.includes(format.delimiter)?"":"none";
    if(format.delimiter && format.countData ) {
        const arrs=code.split(format.delimiter);
        out.countData=arrs.length!=format.countData?arrs.length:""
    }
    else  out.countData="";
    return out;
}