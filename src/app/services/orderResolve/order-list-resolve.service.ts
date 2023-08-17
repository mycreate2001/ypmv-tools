import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { OrderData, _DB_ORDERS } from 'src/app/interfaces/order.model';
import { FirestoreService } from '../firebase/firestore.service-2';
import { _DB_USERS } from 'src/app/interfaces/user.model';
import { _DB_COMPANY } from 'src/app/interfaces/company.model';
// import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OrderListResolveService implements Resolve<OrderData[]>{

  constructor(private db:FirestoreService) { }

  resolve(): Promise<OrderData[]> {
    return this.db.search(_DB_ORDERS)
  }
}
