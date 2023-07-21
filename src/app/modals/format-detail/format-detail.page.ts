import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DisplayService } from 'src/app/services/display/display.service';
import { analysisCode, checkCode, CodeFormatData, CodeFormatList, createExtractData, createFormatData } from 'src/app/interfaces/codeformat';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';

@Component({
  selector: 'app-format-detail',
  templateUrl: './format-detail.page.html',
  styleUrls: ['./format-detail.page.scss'],
})
export class FormatDetailPage implements OnInit {
  /** input  */
  format:CodeFormatData;
  code:string;

  checks:any={};
  results:any={};
  codeFormatList=CodeFormatList;
  LIST=[
    {n:"name",v:"name"},
    {n:"Prefix",v:"prefix"},
    {n:"Subfix",v:"subfix"},
    {n:"Delimiter",v:"delimiter"},
    {n:"CountData",v:"countData"},
    {n:"Length",v:"length"}
  ]
  constructor(
    private modal:ModalController,
    private disp:DisplayService
  ){ }

  /** system Init */
  ngOnInit() {
    if(!this.format) this.format=createFormatData();
    this.update();
  }

  /** scan code */
  scan(){
    const props:QRcodePageOpts={type:'code',title:'any code'}
    this.disp.showModal(QrcodePage,props)
    .then(scan=>{
      const data=scan.data as QRcodePageOuts;
      const role=scan.role as QRcodePageRole;
      if(role!='ok') return;
      this.code=data.code;
    })

  }

  /** exit page */
  done(role:FormatDetailPageRole='ok'){
    const out:FormatDetailPageOuts={
      format:this.format
    }
    this.modal.dismiss(out,role)
  }
  /** delete part of extract */
  async deleteExtract(){
    const buttons=this.format.extractDatas.map((e,i)=>{
      return {text:e.name,data:i,role:'OK'}
    })
    const {role,data}=await this.disp.selectAction({buttons,header:'Delete',subHeader:'which information do you want to delete?'});
    if(role.toLowerCase()!='ok') return;
    this.format.extractDatas.splice(data,1);
  }

  /** add extract information */
  add(){
    const e=createExtractData();
    console.log("extract Data:",e);
    this.format.extractDatas.push(e);
  }

  ////////////////// background ///////////
   /** update */
  update(){
    this.checks=checkCode(this.code,this.format);
    this.results=analysisCode(this.code,this.format)||{}
  }

}


////////////// interface //////////////////
/**
 * @param format:CodeFormatData;
 * @param code:string;
 */
export interface FormatDetailPageOpts{
  format:CodeFormatData;
  code:string;
}

/**
 * @param format:CodeFormatData;
 */
export interface FormatDetailPageOuts{
  format:CodeFormatData;
}

export type FormatDetailPageRole="ok"|"cancel"|"delete"