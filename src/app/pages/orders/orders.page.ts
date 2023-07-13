import { Component, OnInit } from '@angular/core';
import { DisplayService } from 'src/app/services/display/display.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  loading:boolean=true;
  constructor() {
  }

  ngOnInit() {
  }

}
