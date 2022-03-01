import { Component, OnInit } from '@angular/core';
import { analysisCode, CodeFormatData, createExtractData, createFormat, ExtractData } from '../shares/codeformat';
import { fake, fakedata } from '../shares/fakedata';

@Component({
  selector: 'app-formats',
  templateUrl: './formats.page.html',
  styleUrls: ['./formats.page.scss'],
})
export class FormatsPage implements OnInit {
  formats:CodeFormatData[]=fakedata(20,fakeCode);
  code:string='';
  constructor() {
    console.log(this.formats);
   }

  ngOnInit() {
  }

  check(format:CodeFormatData){
    // console.log("code:",this.code);
    if(!this.code) return ""
    const result=analysisCode(this.code,[format])
    return result?"OK":"NG"
  }

}

function fakeCode(i,n,outs):CodeFormatData{
  const extractDatas:ExtractData[]=fakedata(20,fakeExtract)
  return createFormat(extractDatas,{name:'code'+i,order:i})
}

function fakeExtract(i,n,out):ExtractData{
  return createExtractData('extract'+i)
}
