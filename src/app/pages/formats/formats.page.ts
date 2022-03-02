import { Component, OnInit } from '@angular/core';
import { FormatDetailPage } from '../../modals/format-detail/format-detail.page';
import { QrcodePage } from '../../modals/qrcode/qrcode.page';
import { DisplayService } from '../../services/display/display.service';
import { analysisCode } from '../../utils/codeformat';

@Component({
  selector: 'app-formats',
  templateUrl: './formats.page.html',
  styleUrls: ['./formats.page.scss'],
})

export class FormatsPage implements OnInit {
  formats:any[]=[
    {
      name: "tool",
      countData: 2,
      delimiter: "-",
      length: 0,
      order: 0,
      prefix: "T",
      subfix: "",
      extractDatas:[
        {
          finish: 0,
          ignores: [],
          name: "id",
          no: 0,
          start: 1
        },
        {
          finish: 0,
          ignores: [],
          name: "modelid",
          no: 1,
          start: 0
        }
      ]
    }
  ]
  code:string='';
  checkAll:boolean=true;
  constructor(
    private disp:DisplayService
  ) {
    // console.log(this.formats);
   }

  ngOnInit() {
  }

  async scan(){
    const {data,role}=await this.disp.showModal(QrcodePage,{},true);
    if(role.toLowerCase()!='ok') return;
    this.code=data.data;
  }


  update(){
    console.log("\nupdate");
    this.checkAll=true;
    this.formats.forEach(f=>{
      const result= analysisCode(this.code,f);
      f.check=result?true:false;
      if(!f.check) this.checkAll=false;
    })
  }

  async showDetail(format){
    const result=await this.disp.showModal(FormatDetailPage,{format,code:this.code},true)
  }

}