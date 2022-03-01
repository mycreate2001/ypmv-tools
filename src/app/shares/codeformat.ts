//abc-xyz =>abc-xyz
const codeformats=[
    {prefix:'',remorePrefix:false,}
]

export interface CodeFormatData{
    order:number;
    name:string;
    prefix?:string;
    subfix?:string;
    delimiter?:string;
    countData?:number;
    length?:number;
    extractDatas:ExtractData[];
}

export function createFormat(extract:ExtractData[],opts:any={}):CodeFormatData{
    const df:CodeFormatData={
        order:1,
        name:'',
        prefix:'',
        subfix:'',
        delimiter:'',
        countData:0,
        length:0,
        extractDatas:[]
    }
    return {...df,...opts,extractDatas:extract}
}


export interface ExtractData{
    name:string;
    no:number;
    start:number;
    finish:number;
    ignores:string;
    delimiter:string;
    // startBy:string;
    // exitBy:string;
}

export function createExtractData(name:string,opts:any={}):ExtractData{
    const df:ExtractData={
        name:'',
        no:0,
        start:0,
        finish:0,
        ignores:'',
        delimiter:','
    }
    return {...df,...opts,name}
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
            if(!f.countData && arrs.length!=f.countData){
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
    out.length=(format.length && code.length!=format.length)?false:true;
    out.prefix=(format.prefix && !code.startsWith(format.prefix))?false:true;
    out.subfix=(format.subfix && !code.endsWith(format.subfix))?false:true
    out.delimiter=code.includes(format.delimiter);
    if(format.delimiter ) {
        const arrs=code.split(format.delimiter);
        if((arrs.length<=1)||(format.countData && arrs.length!=format.countData)){
            out.countData=false;
        }
        else out.countData=true;
    }
    else  out.countData=true;
    return out;
}