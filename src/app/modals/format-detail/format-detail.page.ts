import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DisplayService } from 'src/app/services/display/display.service';
import { analysisCode, checkCode, CodeFormatData, createExtractData } from 'src/app/utils/codeformat';
import { QrcodePage } from '../qrcode/qrcode.page';

@Component({
  selector: 'app-format-detail',
  templateUrl: './format-detail.page.html',
  styleUrls: ['./format-detail.page.scss'],
})
export class FormatDetailPage implements OnInit {
  format:CodeFormatData;
  code:string;
  checks:any={}
  results:any={}
  constructor(
    private modal:ModalController,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    this.update();
  }

  update(){
    const checks=checkCode(this.code,this.format);
    Object.keys(checks).forEach(key=>{
      if(checks[key]) this.checks[key]="OK"
      else this.checks[key]="NG"
    })
    this.results=analysisCode(this.code,this.format)||{}
    console.log("test",{code:this.code,format:this.format,checks:this.checks,results:this.results})
  }

  async scan(){
    const {data,role}=await this.disp.showModal(QrcodePage);
    if(role.toLowerCase()!='ok') return;
    this.code=data.data;
  }

  done(isdone:boolean=true){
    if(!isdone) return this.modal.dismiss(null,'cancel');
    this.modal.dismiss(this.format,'ok');
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
    const e=createExtractData('new');
    this.format.extractDatas.push(e);
  }

}
