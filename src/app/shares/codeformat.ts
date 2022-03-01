//abc-xyz =>abc-xyz
const codeformats=[
    {prefix:'',remorePrefix:false,}
]

export interface CodeFormatData{
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
    finish?:number;
    ignores?:string[];
    // startBy:string;
    // exitBy:string;
}

export function createExtractData(name:string,opts:any={}):ExtractData{
    const df:ExtractData={
        name:'',
        no:0,
        start:0,
        finish:0,
        ignores:[]
    }
    return {...df,...opts,name}
}

export function analysisCode(code:string,formats:CodeFormatData[]):any{
    const out:any={};
    console.log({code,formats})
    const result= formats.some(f=>{
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
        //return data;
        const extractDatas=f.extractDatas;
        f.extractDatas.forEach(e=>{
            let data=code.split(f.delimiter)[e.no];
            if(!data) return;
            if(e.finish) data=data.substring(e.start,e.finish)
            else data=data.substring(e.start);
            e.ignores.forEach(ignore=>{
                data=data.replace(new RegExp(ignore,'g'),"")
            })
            out[e.name]=data;
        })
        console.log("case 6:OK, out:",out);
        return true;
    })
    if(result) return out;
}