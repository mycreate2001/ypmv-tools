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
    const type=opts.type
    const sizeX=opts.windowSizeX;
    const sizeY=opts.windowSizeY;
    const label=opts.label;
    const size=opts.size;
    code=CodeFormatConfig[type]?CodeFormatConfig[type](code):code
    const windowp=window.open('','',`left=0,top=0,width=${sizeX},height=${sizeY},toolbar=0,scrollbars=0,status=0`);
    windowp.document.write(`
      <style>
        canvas{ width: ${size}px;height: ${size}px;} 
        .cover{display: flex;flex-direction: row;}
        .content{margin-left: 12px;}
        .code{font-size: x-small;}
      </style>`)
    windowp.document.write(`
      <div class="cover">
        <div id="qr-code"></div>
        ${label?`
          <div class="content">
          <div class="label">${label.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</div>
          <div class="code">${code}</div>
        </div>`:''
        }
      </div>`
    );
    QrCreator.render({
      text:code,
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
export interface GenerateQRcodeDataOpts{
  windowSizeX?:number;
  windowSizeY?:number;
  type?:CodeFormatType|"text";
  label?:string;
  size?:number;
}

export interface GenerateQRcodeData{
  windowSizeX:number;
  windowSizeY:number;
  type:CodeFormatType|"text";
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