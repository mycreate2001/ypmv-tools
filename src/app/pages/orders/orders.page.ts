import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderData, OrderDataStatusType, OrderDetail } from 'src/app/models/order.model';
import { BookingPage, BookingPageOpts } from 'src/app/modals/booking/booking.page';
import { DisplayService } from 'src/app/services/display/display.service';
import { MenuData } from 'src/app/models/util.model';
import { searchObj } from 'src/app/utils/data.handle';

type StatusType=OrderDataStatusType|"All"|"Auto"
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  loading:boolean=true;
  orders:OrderDetail[]=[];
  select:StatusType="Auto"; // select display status
  views:OrderDetail[]=[];   // display to user
  keyword:string='';        // search data
  constructor(private readonly route:ActivatedRoute,private disp:DisplayService) {
    
  }

  ngOnInit() {
    this.route.data.subscribe((data)=>{
      console.log("ordersPage/test-001 ",data);
      this.orders=data['orders'];
      this.update();
    })
    
  }

  /////// BUTTONS HANDLER ////////////

  /** detail history */
  detail(order:OrderDetail=null){
    const _order:OrderData={
        ...order,
        userId:order.userId.id,
        approvedBy:order.approvedBy.id,
        companyId:order.companyId.id
    }
    const props:BookingPageOpts={order:_order};//new case
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

   ///////// Backgroup function /////////////////
   update(){
    const viewList:StatusType[]=['approved','created','new','renting']
    const orders=this.select=='All'?
      this.orders:
      this.select=='Auto'?
        this.orders.filter(x=>viewList.includes(x.status)):
        this.orders.filter(x=>x.status==this.select)
    //search
    this.views=this.keyword?searchObj(this.keyword,orders):orders
  }

}
