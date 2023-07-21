import { Component, OnInit } from '@angular/core';
import { FormatDetailPage, FormatDetailPageOpts, FormatDetailPageOuts, FormatDetailPageRole } from '../../modals/format-detail/format-detail.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../../modals/qrcode/qrcode.page';
import { DisplayService } from '../../services/display/display.service';
import { analysisCode, CodeFormatData, createFormatData, _DB_FORMATS } from '../../interfaces/codeformat';
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

  scan(){
    const props:QRcodePageOpts={title:'any code',type:'code'}
    this.disp.showModal(QrcodePage,props,true)
    .then(result=>{
      const out=result.data as QRcodePageOuts;
      const role=result.role as QRcodePageRole;
      if(role!='ok') return;
      this.code=out.code
    })
  }

  /** update keyword */
  update(){
    this.checks=[];
    this.formats.forEach(f=>{
      const result= analysisCode(this.code,f);
      this.checks.push(result?"OK":"NG")
    })
  }

  /** delete format */
  delete(format:CodeFormatData){
    if(!format) return;
    this.db.delete(_DB_FORMATS,format.id)
  }

  /** show detail format */
  async showDetail(format:CodeFormatData=null){
    format=format||createFormatData();
    const props:FormatDetailPageOpts={format,code:this.code}
    this.disp.showModal(FormatDetailPage,props).then(result=>{
        const data=result.data as FormatDetailPageOuts
        const role=result.role as FormatDetailPageRole
        if(role=='ok'){
          this.db.add(_DB_FORMATS,data.format)
          return ;
        }
        if(role=='delete'){
          this.db.delete(_DB_FORMATS,format.id);
          return;
        }
    })
  }

}