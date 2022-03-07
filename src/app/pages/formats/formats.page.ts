import { Component, OnInit } from '@angular/core';
import { FormatDetailPage } from '../../modals/format-detail/format-detail.page';
import { QrcodePage, QRResultType } from '../../modals/qrcode/qrcode.page';
import { DisplayService } from '../../services/display/display.service';
import { analysisCode, CodeFormatData, createFormatData } from '../../models/codeformat';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';


@Component({
  selector: 'app-formats',
  templateUrl: './formats.page.html',
  styleUrls: ['./formats.page.scss'],
})

export class FormatsPage implements OnInit {
  /** variable */
  formats:CodeFormatData[]=[];    // formats
  code:string='';                 //  input test
  dFormat:any;
  checks:any={};
  /** function */
  constructor(
    private disp:DisplayService,
    private db:FirestoreService
  ){
    this.dFormat=this.db.connect('formats');
    this.dFormat.onUpdate(formats=>{
      console.log("formats1:",formats);
      this.formats=formats;
      this.update();
      console.log("formats:",this.formats);
    })
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    console.log("ngOnDestroy");
    this.dFormat.disconnect();
  }

  async scan(){
    const resultType:QRResultType='data only';
    const {data,role}=await this.disp.showModal(QrcodePage,{resultType},true);
    if(role.toLowerCase()!='ok') return;
    this.code=data;
  }


  update(){
    this.checks=[];
    this.formats.forEach(f=>{
      const result= analysisCode(this.code,f);
      this.checks.push(result?"OK":"NG")
    })
  }

  async showDetail(xdata:CodeFormatData){
    const format=xdata||createFormatData();
    
    const {role,data}=await this.disp.showModal(FormatDetailPage,{format,code:this.code});
    if(role.toLowerCase()!='ok') return;

    console.log("data:",data);
    this.dFormat.add(data);
  }

}