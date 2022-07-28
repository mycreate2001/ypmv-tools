import { Injectable } from '@angular/core';
import QrCreator from 'qr-creator';
import { CodeFormatConfig, CodeFormatType } from 'src/app/models/codeformat';
import { createOpts } from 'src/app/utils/minitools';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  generaQRcode(code:string,opts?:GenerateQRcodeDataOpts){
    opts=createGenerateQRcodeData(opts);
    const _code=opts.type=='text'?code:CodeFormatConfig[opts.type](code)
    const windowp=window.open('','',`left=0,top=0,width=${opts.windowSizeX},height=${opts.windowSizeY},toolbar=0,scrollbars=0,status=0`);
    windowp.document.write(`
      <style>
        canvas{ width: ${opts.size}px;height: ${opts.size}px;} 
        .cover{display: flex;flex-direction: row;}
        .content{margin-left: 12px;}
        .code{font-size: x-small;}
      </style>`)
    if(opts.label){
      windowp.document.write(`
        <div class="cover">
          <div id="qr-code"></div>
            <div class="content">
            <div class="label">${opts.label.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</div>
            <div class="code">${code}</div>
          </div>
        </div>`
      );
    }
    else{
      windowp.document.write(`
        <div class="cover">
          <div id="qr-code"></div>
        </div>`
      );
    }
    QrCreator.render({
      text:_code,
      radius:0,
      ecLevel:opts.ecLevel,
      fill:opts.fill,//'#536DFE',
      background:opts.background,
      size:opts.size*20,
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
  type:CodeFormatType|"text"
  label:string;
  size:number;
  background:string;
  fill:string;
  ecLevel:'L'|'M'|'Q'|'H';
}

function createGenerateQRcodeData(opts?:GenerateQRcodeDataOpts){
  const df:GenerateQRcodeData={
    windowSizeX:500,
    windowSizeY:300,
    type:'text',
    label:'',
    size:32,
    background:'',
    fill:'',
    ecLevel:'M'
  }
  return createOpts(df,opts)
}