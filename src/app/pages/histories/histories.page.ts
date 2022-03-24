import { Component, OnInit } from '@angular/core';
import { BookingPage, BookingPageOpts, BookingPageOuts, BookingPageRoleType } from 'src/app/modals/booking/booking.page';
import { _DB_INFORS } from 'src/app/models/bookingInfor.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';

@Component({
  selector: 'app-histories',
  templateUrl: './histories.page.html',
  styleUrls: ['./histories.page.scss'],
})
export class HistoriesPage implements OnInit {

  constructor(
    private disp:DisplayService,
    private db:FirestoreService
  ) { }

  ngOnInit() {
  }

  /////// BUTTONS HANDLER ////////////
  /** new transaction */
  add(){
    const props:BookingPageOpts={};//new case
    this.disp.showModal(BookingPage,props)
    .then(result=>{
      const role=result.role as BookingPageRoleType
      const data=result.data as BookingPageOuts
      if(role=='save'){
        console.log("result/data:",data);
        this.db.add(_DB_INFORS,data.infor)
        return;
      }
    })
  }


  ///////// Backgroup function /////////////////

}
