import { Injectable } from '@angular/core';
import QrCreator from 'qr-creator';
import { CodeFormatConfig, CodeFormatType } from 'src/app/models/codeformat';
import { createOpts, obj2attr } from 'src/app/utils/minitools';
import bwipjs from 'bwip-js'
import { BCIDs, BcIdType, Code2ImagePropertyOpts, createWindowProperty, dfCode2ImageProperty, WindowPropertyOpts } from './util.interface';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from '../display/display.service';


@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private disp:DisplayService) { }

  /**
   * Export png file from code
   * @param code code
   * @param opts 
   * @returns image (png)
   */
  code2Image(code:string,opts:Code2ImagePropertyOpts={}):string{
    const _opts=Object.assign(dfCode2ImageProperty,opts)
    const text=_opts.type=='text'?code:CodeFormatConfig[_opts.type](code);
    const canvas=document.createElement("canvas");
    bwipjs.toCanvas(canvas,{..._opts,text});
    console.log("TEST height:",_opts)
    return canvas.toDataURL('image/png')
  }

  /**
   * Make new popup Window
   * @param template html template
   * @param opts window option
   */
  popUpWindow(template:string="<div id='code-body'></div>",opts:WindowPropertyOpts={}){
    const _opts=createWindowProperty(opts);
    const wd=window.open("","",obj2attr(_opts,{delimiter:",",space:""}));
    wd.document.write(template);
    return wd
  }

  /**
   * make code for new window
   * @param code 
   * @param opts 
   */
  generateCode(code:string,opts:Code2ImagePropertyOpts={}){
    const _opts=Object.assign(dfCode2ImageProperty,opts);
    const _2dcodes:BcIdType[]=['datamatrix','qrcode'];
    const _1dcodes:BcIdType[]=['code128']
    const label=_opts.label;
    // _opts.height=undefined;
    let template="<div id='code-body'></div>"
    if(label &&_2dcodes.includes(_opts.bcid)){
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
          #code-id{font-size: 0.7rem;}
          body{margin: 2px;}
        </style>
        `
    }
    // if(_1dcodes.includes(_opts.bcid)){
    //   _opts.height=4
    // }
    console.log("test-001",{_opts})
    const wd=this.popUpWindow(template);
    const png=this.code2Image(code,_opts);
    wd.document.querySelector('#code-body').innerHTML=`<img src='${png}'/>`
    
  }

  printCode(event:any,code:string,opts:Code2ImagePropertyOpts={}){
    const menus:MenuData[]=[
      {name:'2D QRcode',role:'qrcode-none'},
      {name:'2D QRcode + label',role:'qrcode-label'},
      {name:'2D Datamatrix',role:'datamatrix-none'},
      {name:'2D Datamatrix + label',role:'datamatrix-label'},
      {name:'1D Barcode',role:'code128-none'},
    ]
    this.disp.showMenu(event,{menus}).then(result=>{
      const role=result.role;
      if(role=='backdrop') return;
      const bcid=role.split("-")[0] as BcIdType
      const label=role.split("-")[1]=='label'?opts.label:''
      if(!BCIDs.includes(bcid)) return;
      this.generateCode(code,{...opts,label,bcid})
    })
  }
}


///////// interface //////////////////
// export type GenerateQRcodeDataOpts=Partial<GenerateQRcodeData>

// export interface GenerateQRcodeData{
//   windowSizeX:number;
//   windowSizeY:number;
//   type:CodeFormatType|"text"
//   label:string;
//   size:number;
//   background:string;
//   fill:string;
//   ecLevel:'L'|'M'|'Q'|'H';
// }

// function createGenerateQRcodeData(opts?:GenerateQRcodeDataOpts){
//   const df:GenerateQRcodeData={
//     windowSizeX:500,
//     windowSizeY:300,
//     type:'text',
//     label:'',
//     size:32,
//     background:'',
//     fill:'',
//     ecLevel:'M'
//   }
//   return createOpts(df,opts)
// }