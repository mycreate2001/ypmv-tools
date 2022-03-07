import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DisplayService } from 'src/app/services/display/display.service';
import { analysisCode, checkCode, CodeFormatData, createExtractData, ExtractData } from 'src/app/models/codeformat';
import { QrcodePage, QRResultType } from '../qrcode/qrcode.page';

@Component({
  selector: 'app-format-detail',
  templateUrl: './format-detail.page.html',
  styleUrls: ['./format-detail.page.scss'],
})
export class FormatDetailPage implements OnInit {
  format:CodeFormatData;
  code:string;
  checks:any={};
  results:any={};
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

  ngOnInit() {
    console.log("format:",this.format);
    this.update();
  }

  update(){
    this.checks=checkCode(this.code,this.format);
    this.results=analysisCode(this.code,this.format)||{}
    console.log("test",{code:this.code,format:this.format,checks:this.checks,results:this.results})
  }

  async scan(){
    const resultType:QRResultType='data only'
    const {data,role}=await this.disp.showModal(QrcodePage,{resultType});
    if(role.toLowerCase()!='ok') return;
    this.code=data;
  }

  done(role:string='',data=null){
    if(!role) role='ok'
    const _data=data?data:this.format
    this.modal.dismiss({..._data},role);
    
  }

  async delete(){
    const buttons=this.format.extractDatas.map((e,i)=>{
      return {text:e.name,data:i,role:'OK'}
    })
    const {role,data}=await this.disp.selectAction({buttons,header:'Delete',subHeader:'which information do you want to delete?'});
    if(role.toLowerCase()!='ok') return;
    this.format.extractDatas.splice(data,1);
  }

  add(){
    const e=createExtractData();
    console.log("extract Data:",e);
    this.format.extractDatas.push(e);
  }

}
