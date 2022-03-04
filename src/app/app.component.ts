import { Component } from '@angular/core';
import { FirestoreService } from './services/firebase/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private db:FirestoreService) {

    //test
    function test(data,msg:string=''){
      console.log("\n----- [test] ------\msg:'%s'\n",msg,data);
    }
    const userDb=this.db.connect('users');
    userDb.onUpdate((data)=>console.log("\n\n*************** update data **********\n",data));
    setTimeout(() => {
      userDb.add({date:new Date(),name:'test'},true);
    }, 5000); 
  }
}
