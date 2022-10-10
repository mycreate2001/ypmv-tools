import { CodeFormatType } from "src/app/models/codeformat";
export const BCIDs=['code128','qrcode','datamatrix'] as const
export type BcIdType=typeof BCIDs[number]
export interface Code2ImageProperty{
  bcid:BcIdType;
  scale:number;
  height:number;
  includetext:boolean;
  textxalign:'center'|'right'|'left';
  type:CodeFormatType|'text';
  label:string;
  scaleX:number;
  scaleY:number;
}

export type Code2ImagePropertyOpts=Partial<Code2ImageProperty>

export const dfCode2ImageProperty:Code2ImagePropertyOpts={
    type:'text',
    label:'',
    bcid:'qrcode',
    scale:1,
    // height:10,
    includetext:false
}

/** Window */
export interface WindowProperty{
    left:number;
    top:number;
    width:number;
    height:number;
    toolbar:number;
    scrollbars:number;
    status:number;
}
export type WindowPropertyOpts=Partial<WindowProperty>
const defaultWindow:WindowProperty={
    left:0,
    top:0,
    width:900,
    height:500,
    toolbar:0,
    scrollbars:0,
    status:0
}

export function createWindowProperty(opts:WindowPropertyOpts={}):WindowProperty{
    return Object.assign(defaultWindow,opts)
}