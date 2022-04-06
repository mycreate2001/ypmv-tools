import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserData, _DB_USERS, _STORAGE_USERS } from 'src/app/models/user.model';
import { UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage } from '../camera/camera.page';
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

  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private storage:StorageService,
    private db:FirestoreService
  ) {

  }

  ////////////// SYSTEM FUNCTIONS /////////////////
  ngOnInit() {
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
    const image:UrlData={url:this.addImage,caption:''}
    this.storage.uploadImages([image],_STORAGE_USERS)
    .then((images:UrlData[])=>{
      const image=images[0].url
      this.user.image=image;
      return this.db.add(_DB_USERS,this.user)
    })
    .then(()=>this.done())
  }

  ///////////// BACKGROUND FUNCTIONS //////////////
  update(){
    this.viewImage=this.addImage||this.user.image
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


