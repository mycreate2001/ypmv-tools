import { Component } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { ProfilePage, ProfilePageOpts } from './modals/profile/profile.page';
import { CompanyData, _DB_COMPANY } from './models/company.model';
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
export class AppComponent  {
  /** variable */
  pages:PageData[]=[
    {name:'Tools',url:'tools',icon:'hammer',iconColor:'primary',type:'Yamaha Branch'},
    {name:'Code Format',url:'formats',icon:'qr-code',iconColor:'tertiary',type:'Yamaha Branch'},
    {name:'Companies',url:'companies',icon:'briefcase',type:'Yamaha Branch'},//<ion-icon name="briefcase"></ion-icon>
    {name:'Order List',url:'orders',icon:'refresh',iconColor:'danger'},//<ion-icon name="refresh"></ion-icon>
    {name:'Users',url:"users",icon:"people",iconColor:'success',type:'Yamaha Branch',roles:['admin']},//<ion-icon name="people-outline"></ion-icon>
  ]
  user:UserData=null;
  selectIndex:number=0;
  userUnsubcribe:Unsubscribe;
  isAvailable:boolean=false;
  /** function */
  constructor(
    private auth:AuthService,
    private disp:DisplayService,
    private db:FirestoreService
  ) {
    this.userUnsubcribe=this.auth.onAuthStatusChange(
      user=>{
        this.user=user;
        if(this.user){
          this.db.get(_DB_COMPANY,this.user.companyId)
          
          .then((company:CompanyData)=>{
            console.log("company",{company})
            this.pages=this.pages.filter(page=>{
              //role
              if(page.roles&&page.roles.length&&!page.roles.includes(user.role)) return false;
              //page
              if(!page.type||page.type=='All'||page.type==company.type) return true
              //other
              return false;
            })
          })
        }
      }
    )
  }

  ngOnInit(){ }



  /** show profile */
  showProfile(){
    const props:ProfilePageOpts={
      user:this.user
    }
    this.disp.showModal(ProfilePage,props)
  }

}
