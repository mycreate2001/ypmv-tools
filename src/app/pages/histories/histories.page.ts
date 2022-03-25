import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts, BookingPageOuts, BookingPageRoleType } from 'src/app/modals/booking/booking.page';
import { BookingInfor, createBookingInfor, _DB_INFORS } from 'src/app/models/bookingInfor.model';
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


  ///////// Backgroup function /////////////////
  update(){
    this.views=this.keyword?searchObj(this.keyword,this.histories):this.histories
    this.isAvailable=true;
  }

}
