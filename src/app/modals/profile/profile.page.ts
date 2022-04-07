import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserData, _DB_USERS, _STORAGE_USERS } from 'src/app/models/user.model';
import { UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage, CameraPageOpts, CameraPageOuts, CameraPageRole } from '../camera/camera.page';
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

  /** internal */
  isChange:boolean=false;       // check change data
  isOwner:boolean=false;        // Own acount
  isAvailable:boolean=false;    // enable display data
  viewImage:string;                 // new image
  addImage:string;
  backup:string[]=[]

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
    this._getUser().then(user=>{
      this.user=user;
      this.userId=user.id;
      this.backup=BACKUP_LIST.map(key=>JSON.stringify(this[key]))
      this.updateView();
      this.isAvailable=true;
    })
  }

  // ionViewDidEnter(){
  //   console.log("here")
  //   const inputs=document.querySelectorAll("app-profile input")
  //   console.log(inputs)
  //   inputs.forEach(input=>input.addEventListener(''))
  // }


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
    const image:UrlData={url:this.addImage,caption:''}
    this.storage.uploadImages([image],_STORAGE_USERS)
    .then((images:UrlData[])=>{
      const image=images[0].url
      this.user.image=image;
      return this.db.add(_DB_USERS,this.user)
    })
    .then(()=>this.done())
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

  ///////////// BACKGROUND FUNCTIONS //////////////

  /** update view */
  updateView(){
    this.viewImage=this.addImage||this.user.image
    if(this.userId==this.auth.currentUser.id) this.isOwner=true;
    this.isChange=BACKUP_LIST.every((key,pos)=>JSON.stringify(this[key])==this.backup[pos])?false:true
  }
  
  /** get user */
  private _getUser():Promise<UserData>{
    return new Promise((resolve,reject)=>{
      if(!this.userId&&!this.user){//current user
        const user=this.auth.currentUser;
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
  user:UserData;
}

export interface ProfilePageOuts{
  user:UserData;
}

export type ProfilePageRole="ok"|"back"


