import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Unsubscribe } from 'firebase/auth';
import { ProfilePage } from './modals/profile/profile.page';
import { UserData } from './models/user.model';
import { MenuData, PageData } from './models/util.model';
import { DisplayService } from './services/display/display.service';
import { AuthService } from './services/firebase/auth.service';
import { FirestoreService } from './services/firebase/firestore.service';
const _DB_USER='users';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  /** variable */
  pages:PageData[]=[
    {name:'Scan',url:'add',icon:'scan-circle',iconColor:'success'},
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
      this.db.get(_DB_USER,user.uid)
      .then(data=>{
        this.user=data as UserData
      })
    })
  }

  menu(event){
    const menus:MenuData[]=[
      {
        name:'Sign Out',icon:'log-out-outline',iconColor:'danger',
        handler:()=>{
          this.auth.logout().then(()=>{
            this.userUnsubcribe();
            this.user=null;
            this.router.navigateByUrl("/");
          });
        }
      },
      {
        name:'Profile',
        icon:'person-circle-outline',iconColor:'primary',
        handler:()=>this.disp.showModal(ProfilePage,{user:this.user})
      }
    ];
    this.disp.showMenu(event,{menus})
  }
}
