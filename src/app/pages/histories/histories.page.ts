import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts, BookingPageOuts, BookingPageRoleType } from 'src/app/modals/booking/booking.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from 'src/app/modals/qrcode/qrcode.page';
import { BookingInfor, BookingInforStatusType, createBookingInfor, _DB_INFORS } from 'src/app/models/bookingInfor.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { searchObj } from 'src/app/utils/data.handle';

@Component({
  selector: 'app-histories',
  templateUrl: './histories.page.html',
  styleUrls: ['./histories.page.scss'],
})
export class HistoriesPage implements OnInit {
  /** db */
  historyDb:ConnectData;
  histories:BookingInfor[]=[];

  /** internal */
  views:BookingInfor[]=[];
  keyword:string=''
  /** control */
  isAvailable:boolean=false;
  select:BookingInforStatusType|"All"="All"
  constructor(
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService
  ) { }

  ngOnInit() {
    this.historyDb=this.db.connect(_DB_INFORS);
    this.historyDb.onUpdate((histories:BookingInfor[])=>{
      this.histories=histories;
      this.update();
    })
  }

  /////// BUTTONS HANDLER ////////////

  /** detail history */
  detail(history:BookingInfor=null){
    history=history?history:createBookingInfor({userId:this.auth.currentUser.id})
    const props:BookingPageOpts={infor:history};//new case
    this.disp.showModal(BookingPage,props)
    .then(result=>{
      const role=result.role as BookingPageRoleType
      const data=result.data as BookingPageOuts
      if(role=='save'){
        console.log("result/data:",data);
        this.db.add(_DB_INFORS,data.infor)
        return;
      }
      if(role=='delete'){
        //delete all images @@@
        //delete data
        this.db.delete(_DB_INFORS,data.infor.id)
      }
    })
  }

  /** option select */
  option(event){
    const status:(BookingInforStatusType|"All")[]=["All","created","approved","renting","returned","rejected"]
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
