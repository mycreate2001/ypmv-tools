import { CodeFormatType } from "src/app/models/codeformat";

//////// interface //////////////////
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

export function createGenerateQRcodeData(opts?:GenerateQRcodeDataOpts){
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
  return Object.assign(df,opts)
}

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

export interface BarcodeProperty{
  format:String;
  width:Number;
  height:Number;
  displayValue:Boolean;
  text:String;
  fontOptions:String;
  font:String;
  textAlign:String;
  textPosition:String;
  textMargin:Number;
  fontSize:Number;
  background:String;
  lineColor:String;
  margin:Number;
  marginTop:Number;
  marginBottom:Number;
  marginLeft:Number;
  marginRight:Number;
}

export type BarcodePropertyOpts=Partial<BarcodeProperty>
export function createBarcodeProperty(opts:BarcodePropertyOpts={}){
    return Object.assign(BarcodePropertyDefault,opts)
}
const BarcodePropertyDefault:BarcodeProperty={
  format:"code128",
  width:2,
  height:100,
  displayValue:true,
  text:undefined,
  fontOptions:"",
  font:"monospace",
  textAlign:"center",
  textPosition:"bottom",
  textMargin:2,
  fontSize:20,
  background:"#ffffff",
  lineColor:"#000000",
  margin:10,
  marginTop:undefined,
  marginBottom:undefined,
  marginLeft:undefined,
  marginRight:undefined,
}

export enum defaultHtml{
    _2DcodeOnly=`<div id="body"><div id="code"></div></div>`,
    _2DcodeWidthLabel=`<div id="body"><div id="code"></div><div id="title"></div></div>`,
    _1Dcode=`<div id='code'></div>`
}