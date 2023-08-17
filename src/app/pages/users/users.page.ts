import { Component, OnInit } from '@angular/core';
import { ProfilePage, ProfilePageOpts } from 'src/app/modals/profile/profile.page';
import { CompanyData, _DB_COMPANY } from 'src/app/interfaces/company.model';
import { UserConfig, _DB_CONFIGS } from 'src/app/interfaces/config';
import { UserData, UserRole, _DB_USERS } from 'src/app/interfaces/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { getList } from 'src/app/utils/minitools';
import { configs} from '../../interfaces/config'
interface ViewsData{
  group:string;
  users:UserData[]
}
@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  userDb:ConnectData=null;
  isAvailable:boolean=false;
  isAdmin:boolean=false;
  views:ViewsData[]=[];
  constructor(
    private db:FirestoreService,
    private disp:DisplayService,
    private auth:AuthService
  ) { }

  ngOnInit() {
    this.userDb=this.db.connect(_DB_USERS);
    this.userDb.onUpdate(async (users:UserData[])=>{
      //filter
      users=users.filter(u=>!u.deactive)
      const companiesId=getList(users,"companyId");
      const companies:CompanyData[]=await this.db.gets(_DB_COMPANY,companiesId);
      const cUser=this.auth.currentUser;
      const allowList:UserRole[]=["admin"]
      this.isAdmin= allowList.includes(cUser.role)?true:false;
      this.views=companies.map(company=>{
        const _users:UserData[]=users.filter(u=>u.company.id==company.id);
        const view={group:company.name,users:_users}
        return view;
      })
      this.isAvailable=true;
    })
  }

  /** detail */
  detail(user:UserData){
    console.log("admin?",this.isAdmin);
    const progs:ProfilePageOpts={
      user,
      userId:user.id,
      isAdmin:this.isAdmin
    }
    this.disp.showModal(ProfilePage,progs)
  }

  /** new user */
  newUser(){
    if(!this.isAdmin) return;
    const progs:ProfilePageOpts={
      isAdmin:true,
      isNew:true
    }
    this.disp.showModal(ProfilePage,progs)
  }

}
