import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { config } from '../../utils/config'
import { CompanyData, _DB_COMPANY } from 'src/app/interfaces/company.model';
import { configs, UserConfig, _DB_CONFIGS } from 'src/app/interfaces/config';
import { createUserData, UserData, UserRoleList, _DB_USERS, _STORAGE_USERS } from 'src/app/interfaces/user.model';

import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage, CameraPageOpts, CameraPageOuts, CameraPageRole } from '../camera/camera.page';
import { UrlData } from 'src/app/interfaces/util.model';
const BACKUP_LIST=["user",'addImage']

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  /** input */
  userId:string;
  user:UserData=null;           // user data
  isAdmin:boolean=false;
  /** internal */
  isNew:boolean=false;          // new user
  isChange:boolean=false;       // check change data
  isOwner:boolean=false;        // Own acount
  isAvailable:boolean=false;    // enable display data
  viewImage:string;                 // new image
  addImage:string;
  backup:string[]=[];
  companies:CompanyData[]=[];
  roles=UserRoleList;
  pass:string='';
  isHide:boolean=true;
  constructor(
    private modal:ModalController,
    private storage:StorageService,
    private db:FirestoreService,
    private auth:AuthService,
    private disp:DisplayService
  ) {

  }

  ////////////// SYSTEM FUNCTIONS /////////////////
  ngOnInit() {
    const _user=this._getUser();
    const _companies=this.db.search(_DB_COMPANY,[]);
    Promise.all([_user,_companies]).then(([user,companies])=>{
      this.companies=companies;
      this.user=user;
      this.userId=user.id;
      this.updateView()
    })

    

  }

  ////////////// BUTTONS & EVENTS HANDLER ////////
  /** Exit page */
  done(role:ProfilePageRole='ok'){
    const out:ProfilePageOuts={
      user:this.user
    }
    this.modal.dismiss(out,role)
  }

  /** save profile */
  save(){
    this.storage.uploadImages(this.addImage||[],`${_STORAGE_USERS}/${this.user.id}/`)
    .then((images:UrlData[])=>{
      if(images.length){
        this.user.image=images[0]
      }
      return this.db.add(_DB_USERS,this.user)
    })
    .then(()=>this.done())
  }

  /** signout */
  signOut(){
    this.auth.logout()
    .then(()=>this.disp.goto("/"))
    .then(()=>this.done('back'))
  }
 
  /** take photo */
  takePhoto(){
    const props:CameraPageOpts={
      aspectRatio:1,
      fix:true
    }
    this.disp.showModal(CameraPage,props)
    .then(result=>{
      const role=result.role as CameraPageRole;
      if(role!='ok') return;
      const data=result.data as CameraPageOuts;
      this.addImage=data.image;
      this.updateView();
    })
  }

  del(){
    this.disp.msgbox("Are you sure want to delete this account?",{buttons:[{text:'OK',role:'ok'},{role:'cancel',text:'Cancel'}]}).then(result=>{
      if(result.role!='ok') return;
      this.user.deactive=true
      this.db.add(_DB_USERS,this.user).then(()=>this.done("delete"))
    })
  }

  /** register new user */
  async register(){
    try{
      const user=await this.auth.register(this.user.email,this.pass)
      const id=user.user.uid;
      await this.db.add(_DB_USERS,{...this.user,id})
      console.log("register successfully")
    }
    catch(err){
      console.log("register failured! ",{error:err.messager})
    }
    this.done('register');

  }

  ///////////// BACKGROUND FUNCTIONS //////////////

  /** update view */
  updateView(){
    const userImage=typeof this.user.image=='string'?this.user.image:this.user.image.url
    this.viewImage=this.addImage||userImage
    if(this.userId==this.auth.currentUser.id) this.isOwner=true;
    this.isChange=BACKUP_LIST.every((key,pos)=>JSON.stringify(this[key])==this.backup[pos])?false:true
    //avaiable
    this.isAvailable=true;
  }
  
  /** get user */
  private async  _getUser():Promise<UserData>{
    return new Promise((resolve,reject)=>{
      if(this.isNew) 
        return resolve(createUserData({createAt:new Date().toISOString(),role:'standard'}))
      if(!this.userId&&!this.user){ //current user
        const user=this.auth.currentUser;
        if(!user) return reject(new Error('Not yet login'))
        return resolve(user)
      }
      if(this.user) return resolve(this.user)
      //userId
      this.db.get(_DB_USERS,this.userId)
      .then((user:UserData)=>resolve(user))
      .catch(err=>reject(err))
    })
  }


}

///////////////// INTERFACE //////////////////////////////
export interface ProfilePageOpts{
  userId?:string;
  user?:UserData;
  isAdmin?:boolean;
  isNew?:boolean;
}

export interface ProfilePageOuts{
  user:UserData;
}

export type ProfilePageRole="ok"|"back"|"register"|"save"|"delete"


