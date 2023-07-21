import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DetailFromId, OrderData, OrderDetail, _DB_ORDERS } from 'src/app/interfaces/order.model';
import { FirestoreService } from '../firebase/firestore.service-2';
import { getList } from 'src/app/utils/minitools';
import { _DB_USERS, UserData } from 'src/app/interfaces/user.model';
import { CompanyData, _DB_COMPANY } from 'src/app/interfaces/company.model';
// import { Observable } from 'rxjs';

const USERS_ID_LIST=["userId","approvedBy"];
const COMPANY_ID_LIST=["companyId"]


@Injectable({
  providedIn: 'root'
})
export class OrderListResolveService implements Resolve<OrderDetail[]>{

  constructor(private db:FirestoreService) { }

  resolve(): Promise<OrderDetail[]> {
    // console.log("[order-list-resolve] resolve/test-001: start")
    return this.db.search(_DB_ORDERS).then((orders:OrderData[])=>{
      //users
      let usersId:string[]=[];
      usersId=getList(orders,USERS_ID_LIST);
      const $users:Promise<UserData[]>= this.db.gets(_DB_USERS,usersId);
      //company
      let companiesId:string[]=getList(orders,COMPANY_ID_LIST);
      const $companies:Promise<CompanyData[]>=this.db.gets(_DB_COMPANY,companiesId);

      //confirm get all data
      return Promise.all([$users,$companies]).then(([users,companies])=>{
        const orderDetails:OrderDetail[]=orders.map(order=>{
          const userId=users.find(u=>u.id===order.userId);
          const approvedBy=users.find(u=>u.id===order.approvedBy);
          const companyId=companies.find(c=>c.id===order.companyId);
          //convert & return result
          return {
            ...order,
            userId:{id:order.userId,name:userId?.name,image:userId?.image},
            approvedBy:{id:order.approvedBy,name:approvedBy?.name,image:approvedBy?.image},
            companyId:{id:order.companyId,name:companyId?.name,image:companyId?.image}
            
          }
        })
        return orderDetails;
      })

    })
  }
}
