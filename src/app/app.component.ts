import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Unsubscribe } from 'firebase/auth';
import { UserData, _DB_USERS } from './models/user.model';
import { PageData } from './models/util.model';
import { DisplayService } from './services/display/display.service';
import { AuthService } from './services/firebase/auth.service';
import { FirestoreService } from './services/firebase/firestore.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  /** variable */
  pages:PageData[]=[
    {name:'Tools',url:'tools',icon:'hammer',iconColor:'primary'},
    {name:'Code Format',url:'formats',icon:'qr-code',iconColor:'tertiary'},
    {name:'Companies',url:'companies',icon:'briefcase'},//<ion-icon name="briefcase"></ion-icon>
  ]
  user:UserData=null;
  selectIndex:number=0;
  userUnsubcribe:Unsubscribe;
  /** function */
  constructor(
    private auth:AuthService,
    private router:Router,
    private disp:DisplayService,
    private db:FirestoreService
  ) {
    this.userUnsubcribe=this.auth.onAuthStatusChange(user=>{
      if(!user) return this.router.navigateByUrl('login');
      this.db.get(_DB_USERS,user.uid)
      .then(data=>{
        this.user=data as UserData
      })
    })
  }

}
