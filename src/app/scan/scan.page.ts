import { Component, OnInit } from '@angular/core';
import { QrcodePage } from '../modals/qrcode/qrcode.page';
import { DisplayService } from '../services/display/display.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  constructor(
    private disp:DisplayService
  ) { }

  ngOnInit() {
  }

  async qrcode(){
    let result=await this.disp.showModal(QrcodePage);
    
    if(result.role.toLowerCase()!='ok'){console.log("cancel"); return;}
    console.log(result.data.data);
  }
}
