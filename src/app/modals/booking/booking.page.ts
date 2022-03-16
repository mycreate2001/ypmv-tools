import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BookingInfor, createBookingInfor } from 'src/app/models/bookingInfor.model';
import { CompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { UserData } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
const _DB_BOOKING="bookInfors"
@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  infor:BookingInfor;
  user:UserData;
  isAvailable:boolean=false;
  companies:CompanyData[]=[];
  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
  )
  {
    this.user=this.auth.currentUser;
    this.db.search(_DB_COMPANY)
    .then((companies:CompanyData[])=>{
      this.companies=companies;
      // this.isAvailabel=true;
      this.isAvailable=true;
      console.log("update company")
    })
  }

  ngOnInit() {
    console.log("\ninitial infor",this.infor);
  }

  getDate(value):string{
    const date=new Date(value);
    return date.toISOString()
  }

  done(role:string='OK'){
    this.modal.dismiss(this.infor,role)
  }

  /** hander save button */
  save(){
    this.db.add(_DB_BOOKING,this.infor)
    .then(()=>this.done())
    .catch(err=>this.disp.msgbox("ERROR<br>"+err.message))
  }

}
