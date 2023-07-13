import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts } from 'src/app/modals/booking/booking.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from 'src/app/modals/qrcode/qrcode.page';
import { OrderData, OrderDataStatusType, _DB_ORDERS } from 'src/app/models/order.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import { CompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { UserRole, _DB_USERS } from 'src/app/models/user.model';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { searchObj } from 'src/app/utils/data.handle';

type StatusType=OrderDataStatusType|"All"|"Auto"

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  /** db */
  orderDb:ConnectData;
  orders:OrderData[]=[];

  /** internal */
  views:OrderData[]=[];
  keyword:string=''
  /** control */
  isAvailable:boolean=false;
  select:StatusType="Auto"
  constructor(
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService,
  ) { }

  ngOnInit() {
    this.orderDb=this.db.connect(_DB_ORDERS,true);
    this.orderDb.onUpdate(async (orders:OrderData[])=>{
      try{
        //filter
        const cUser=this.auth.currentUser;
        const company:CompanyData=await this.db.get(_DB_COMPANY,cUser.companyId)
        const allowList:UserRole[]=["admin","manager"];
        if(company.type=='Yamaha Branch'||allowList.includes(cUser.role)) this.orders=orders;//see all
        else{
          this.orders=orders.filter(h=>h.companyId==cUser.companyId)
        }
        this.update();
      }
      catch(err){
        console.log("update orderlist is error\n",{err:err.messager});
      }
    })
  }


  ngOnDestroy(){
    this.orderDb.disconnect();
  }

  /////// BUTTONS HANDLER ////////////

  /** detail history */
  detail(order:OrderData=null){
    const props:BookingPageOpts={order};//new case
    this.disp.showModal(BookingPage,props)
  }

  /** option select */
  option(event){
    const status:StatusType[]=["Auto","All","created","approved","renting","returned","rejected"]
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
      const role=scan.role as QRcodePageRole;
      if(role!='ok') return;
      const data=scan.data as QRcodePageOuts;
      const id:string=data.analysis[CodeFormatConfig.order.name]
      if(!id) return;
      const infor=this.orders.find(h=>h.id==id);
      if(!infor) return console.log("cannot find this infor");
      this.detail(infor)
    })
    // const props:Scan2PageOpts={
    //   type:'analysis',
    //   title:'orderId'
    // }
    // this.disp.showModal(Scan2Page,props)
  }


  ///////// Backgroup function /////////////////
  update(){
    //filter by option
    // const _AutoList:OrderDataStatusType|'All'|'Auto'[]=[]
    console.log("\n*********** init *********\n",this);
    const viewList:StatusType[]=['approved','created','new','renting']
    const orders=this.select=='All'?
      this.orders:
      this.select=='Auto'?
        this.orders.filter(x=>viewList.includes(x.status)):
        this.orders.filter(x=>x.status==this.select)
    //search
    this.views=this.keyword?searchObj(this.keyword,orders):orders
    this.isAvailable=true;
  }

}
