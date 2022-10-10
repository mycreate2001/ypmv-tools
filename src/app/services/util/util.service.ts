import { Injectable } from '@angular/core';
import QrCreator from 'qr-creator';
import { CodeFormatConfig, CodeFormatType } from 'src/app/models/codeformat';
import { createOpts, obj2Attr } from 'src/app/utils/minitools';
import bwipjs from "bwip-js"
import { createWindowProperty, defaultHtml, WindowPropertyOpts } from './util.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /**
   * Make new window / popup new windows
   * @param content default=<div id='root'></div>
   * @param opts 
   * @returns 
   */
  popUpWindow(content:string="<div id='root'></div>",opts:WindowPropertyOpts={}){
    const _opts=createWindowProperty(opts);
    const wd=window.open('','',obj2Attr(_opts,{valueMask:"",delimiter:','}))
    wd.document.write(content);
    wd.focus();
    return wd;
  }

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

  exportQRcode(code:string,selector:string|HTMLElement,opts?:GenerateQRcodeDataOpts){
    //handler Inputing
    opts=createGenerateQRcodeData(opts);
    const _code=opts.type=='text'?code:CodeFormatConfig[opts.type](code)
    const _doc=typeof selector=='string'?<HTMLElement>document.querySelector(selector):selector
    //make code
    QrCreator.render({
      text:_code,
      radius:0,
      ecLevel:opts.ecLevel,
      fill:opts.fill,
      background:opts.background,
      size:opts.size
    },_doc)
  }

  exportCode(code:string,selector:string|Element,opts:GenerateCodePropertyOpts={}){
    const _opts=Object.assign(GenerateCodePropertyDefault,opts)
    const text=_opts.type=='text'?code:CodeFormatConfig[_opts.type](code);
    //const _code=opts.type=='text'?code:CodeFormatConfig[opts.type](code)
    if(!selector){
      let template=`<div id='code-body'></div>`
      if(_opts.label && (['datamatrix','qrcode'].includes(_opts.bcid))){
        template=`<div id='code-container' display='flex'>
          <div id='code-body'></div>
          <div id='code-infor'>
            <div id='code-label'>${_opts.label}</div>
            <div id='code-id'>${code}<div>
          </div>
        </div>
        <style>
          #code-container{display:flex}
          #code-infor{margin-left:12px;flex-direction:column;}
          #code-label {font-weight: bold;text-transform: capitalize;}
        </style>
        `
      }
      const wd=this.popUpWindow(template);
      wd.document.write(``)
      selector=wd.document.querySelector('#code-body');
    }
    const element=typeof selector=='string'? document.querySelector(selector):selector;
    if(!element) return console.warn("selector is wrong");
    // element.innerHTML="<canvas id='code'></canvas>"
    const canvas=document.createElement("canvas");
    bwipjs.toCanvas(canvas,{..._opts,text});
    element.innerHTML=`<img src="${canvas.toDataURL('image/png')}">`
  }
}

export type BcidType="code128"|"datamatrix"|"qrcode";
export interface GenerateCodeProperty{
  bcid:BcidType;
  scale:number;
  height:number;
  includetext:boolean;
  textxalign:'center'|'right'|'left';
  type:CodeFormatType|'text';
  label:string;
}

export const GenerateCodePropertyDefault:GenerateCodeProperty={
  bcid:'code128',
  scale:2,
  height:10,
  includetext:false,
  textxalign:'center',
  type:'text',
  label:''
}

export type GenerateCodePropertyOpts=Partial<GenerateCodeProperty>

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