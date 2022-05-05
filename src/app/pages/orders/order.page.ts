import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts } from 'src/app/modals/booking/booking.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from 'src/app/modals/qrcode/qrcode.page';
import { OrderData, OrderDataStatusType, _DB_ORDERS } from 'src/app/models/order.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import { _DB_COMPANY } from 'src/app/models/company.model';
import { _DB_USERS } from 'src/app/models/user.model';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { searchObj } from 'src/app/utils/data.handle';



@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  /** db */
  historyDb:ConnectData;
  histories:OrderData[]=[];

  /** internal */
  views:OrderData[]=[];
  keyword:string=''
  /** control */
  isAvailable:boolean=false;
  select:OrderDataStatusType|"All"="All"
  constructor(
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService,
  ) { }

  ngOnInit() {
    this.historyDb=this.db.connect(_DB_ORDERS,true);
    this.historyDb.onUpdate((histories)=>{
      this.histories=histories;
      this.update();
    })
  }

  ngOnDestroy(){
    this.historyDb.disconnect();
  }

  /////// BUTTONS HANDLER ////////////

  /** detail history */
  detail(order:OrderData=null){
    const props:BookingPageOpts={order};//new case
    this.disp.showModal(BookingPage,props)
  }

  /** option select */
  option(event){
    const status:(OrderDataStatusType|"All")[]=["All","created","approved","renting","returned","rejected"]
    const menus:MenuData[]=status.map(stt=>{
      const menu:MenuData={
        name:stt,
        handler:()=>{this.select=stt;this.update()}
      }
      return menu
    })
    this.disp.showMenu(event,{menus})
  }

  /** scan code */
  scan(){
    const props:QRcodePageOpts={type:'analysis',title:'booking Id'}
    this.disp.showModal(QrcodePage,props)
    .then(scan=>{
      const data=scan.data as QRcodePageOuts;
      const role=scan.role as QRcodePageRole;
      if(role!='ok') return;
      console.log("Name:",CodeFormatConfig.booking.name);
      const id:string=data.analysis[CodeFormatConfig.booking.name]
      if(!id) return;
      const infor=this.histories.find(h=>h.id==id);
      if(!infor) return console.log("cannot find this infor");
      this.detail(infor)
    })
  }


  ///////// Backgroup function /////////////////
  update(){
    //filter by option
    const histories=this.select=='All'?this.histories:this.histories.filter(x=>x.status==this.select)
    //search
    this.views=this.keyword?searchObj(this.keyword,histories):histories
    this.isAvailable=true;
  }

}
