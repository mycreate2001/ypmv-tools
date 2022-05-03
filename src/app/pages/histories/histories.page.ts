import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts, BookingPageOuts, BookingPageRoleType } from 'src/app/modals/booking/booking.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from 'src/app/modals/qrcode/qrcode.page';
import { BookingInfor, BookingInforStatusType, createBookingInfor, _DB_INFORS } from 'src/app/models/bookingInfor.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import { createCompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { createUserData, _DB_USERS } from 'src/app/models/user.model';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { ResolverService, Schema } from 'src/app/services/firebase/resolver.service';
import { searchObj } from 'src/app/utils/data.handle';

const config:Schema={
  table:_DB_INFORS,
  name:'root',
  queries:[],
  items:[...Object.keys(createBookingInfor()),
    {
      table:_DB_USERS,
      name:'CreateBy',
      queries:{key:'id',type:'==',value:'%userId%'},
      items:[...Object.keys(createUserData()),
        {
          table:_DB_COMPANY,
          name:'Company',
          queries:{key:'id',type:'==',value:'%companyId%'},
          items:Object.keys(createCompanyData())
        }
      ]
    },
    {
      table:_DB_USERS,
      name:'ApprovedBy',
      queries:{key:'id',type:'==',value:'%approvedBy%'},
      items:[...Object.keys(createUserData())]
    }
  ]
}

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
    private auth:AuthService,
    private rs:ResolverService
  ) { }

  ngOnInit() {
    this.historyDb=this.db.connect(_DB_INFORS,true);
    this.historyDb.onUpdate((histories)=>{
      this.histories=histories;
      console.time("test1")
      this.rs.query(config).then(histories=>{console.timeEnd('test1');console.log("\ntest\n------------------\n",{histories})})
      this.update();
    })
  }

  ngOnDestroy(){
    this.historyDb.disconnect();
  }

  /////// BUTTONS HANDLER ////////////

  /** detail history */
  detail(history:BookingInfor=null){
    const props:BookingPageOpts={infor:history};//new case
    this.disp.showModal(BookingPage,props)
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
