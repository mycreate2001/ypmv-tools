import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserData } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage } from '../camera/camera.page';
const _DB_USER="users"
const _STORAGE_AVATAR="avatars"
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  /** variable */
  user:UserData=null;
  isChange:boolean=false;
  isEdit:boolean=false;
  image:string;
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private storage:StorageService,
    private db:FirestoreService
  ) {

  }

  ngOnInit() {
  }

  done(role:string='OK'){
    this.modal.dismiss({image:this.image,user:this.user},role)
  }

  addImage(){
    this.disp.showModal(CameraPage,{ratio:1,fix:true})
    .then(result=>{
      if(result.role.toUpperCase()!='OK') return;
      this.isChange=true;
      console.log("image-size:",result.data.length);
      this.image=result.data;
    })
  }

  save(){
    this.uploadImage()
    .then(user=>{
      return this.db.add(_DB_USER,user);
    })
    .then(()=>{
      this.done()
    })
    .catch(err=>this.disp.msgbox("error<br>"+err.message))
  }

  uploadImage():Promise<UserData>{
    return new Promise((resolve,reject)=>{
      if(!this.image) return resolve(this.user);
      this.storage.uploadImagebase64(this.image,`${_STORAGE_AVATAR}/${this.user.id}.jpg`)
      .then(u=>{
        this.user.image=u.url;
        return resolve(this.user)
      })
      .catch(err=>reject(err))
    })
  }

}
