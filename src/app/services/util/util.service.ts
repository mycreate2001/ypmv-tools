import { Injectable } from '@angular/core';
import QrCreator from 'qr-creator';
import { createOpts } from 'src/app/utils/minitools';
const config={
  toolId:(id)=>`TL$${id}`,
  coverId:(id)=>`CV$${id}`,
  modelId:(id)=>`MD$${id}`,
  orderId:(id)=>`OR$${id}`
}
export type CodeType=keyof typeof config
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  generaQRcode(code:string,opts?:GenerateQRcodeDataOpts){
    opts=createGenerateQRcodeData(opts);
    const _code=opts.type=='text'?code:config[opts.type](code)
    // const type=opts.type
    // const sizeX=opts.windowSizeX;
    // const sizeY=opts.windowSizeY;
    // const label=opts.label;
    // const size=opts.size;
    // code=CodeFormatConfig[type]?CodeFormatConfig[type](code):code
    const windowp=window.open('','',`left=0,top=0,width=${opts.windowSizeX},height=${opts.windowSizeY},toolbar=0,scrollbars=0,status=0`);
    windowp.document.write(`
      <style>
        canvas{ width: ${opts.size}px;height: ${opts.size}px;} 
        .cover{display: flex;flex-direction: row;}
        .content{margin-left: 12px;}
        .code{font-size: x-small;}
      </style>`)
    windowp.document.write(`
      <div class="cover">
        <div id="qr-code"></div>
        ${opts.label?`
          <div class="content">
          <div class="label">${opts.label.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</div>
          <div class="code">${code}</div>
        </div>`:''
        }
      </div>`
    );
    QrCreator.render({
      text:_code,
      radius:0,
      ecLevel:'H',
      // fill:'#536DFE',
      background:null,
      // size:128
    }, windowp.document.querySelector('#qr-code'))
    windowp.focus();
    // windowp.print();
    // windowp.close();
  }

}


///////// interface //////////////////
export type GenerateQRcodeDataOpts=Partial<GenerateQRcodeData>

export interface GenerateQRcodeData{
  windowSizeX:number;
  windowSizeY:number;
  type:CodeType|"text"
  label:string;
  size:number;
}

function createGenerateQRcodeData(opts?:GenerateQRcodeDataOpts){
  const df:GenerateQRcodeData={
    windowSizeX:500,
    windowSizeY:300,
    type:'text',
    label:'',
    size:32
  }
  return createOpts(df,opts)
}