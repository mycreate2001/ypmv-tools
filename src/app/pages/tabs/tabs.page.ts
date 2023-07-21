import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts } from 'src/app/modals/booking/booking.page';
import { CoverPage, CoverPageOpts } from 'src/app/modals/cover/cover.page';
import { QRcodePageOpts, QRcodePageOuts, QRcodePageRole, QrcodePage } from 'src/app/modals/qrcode/qrcode.page';
import { ToolPage, ToolPageOpts } from 'src/app/modals/tool/tool.page';
import { CoverData } from 'src/app/interfaces/cover.interface';
import { DisplayService } from 'src/app/services/display/display.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(private disp: DisplayService) { }

  ngOnInit() {
  }

  ///
  displayTool(toolId: string){
    const props: ToolPageOpts={
      toolId
    };
    this.disp.showModal(ToolPage,props).then(result=>{
      console.log({result});
    });
  }

  displayCover(coverId:string){
    const props:CoverPageOpts={
      coverId
    }
    return this.disp.showModal(CoverPage,props)
  }

  displayOrder(inforId:string){
    const props:BookingPageOpts={
      inforId
    }
    return this.disp.showModal(BookingPage,props)
  }

  scan(){
    // console.log('scan');
    const props: QRcodePageOpts={
      type:'analysis',

    };

    this.disp.showModal(QrcodePage,props)
    .then(result=>{
      const role=result.role as QRcodePageRole;
      if(role!=='ok') return;
      const data=result.data as QRcodePageOuts;
      const analysis=data.analysis as AnalysisData;
      let code=analysis.tool;
      if(code) {
        this.displayTool(code);
        return;
      }
      code=analysis.cover;
      if(code) {
        this.displayCover(code);
        return;
      }
      
      code=analysis.order;
      if(code) {
        this.displayOrder(code);
        return;
      }
      this.disp.msgbox("this code is not include 'tool,box or order' code")

    })
  }

  
}

interface AnalysisData{
  tool?:string;
  cover?:string;
  model?:string;
  order?:string;
}
