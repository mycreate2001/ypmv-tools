import { Component } from '@angular/core';
import { CameraPage } from '../modals/camera/camera.page';
import { DisplayService } from '../services/display/display.service';
import { AuthService } from '../services/firebase/auth.service';
import { FirestoreService } from '../services/firebase/firestore.service';
import { StorageService } from '../services/firebase/storage.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  user:string='';
  pass:string='';
  isLogin:boolean=false;
  loginForm:boolean=true;
  image:any=null;
  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private disp:DisplayService,
    private storage:StorageService
    ) {}
  register(){
    return this.auth.register(this.user,this.pass)
    .then(user=>{
      console.log("[TEST-003]: register successfully!")
    })
    .catch(err=>console.log("[TEST-004] **** ERR[4]***\nregister error",err))
  }
  login(){
    this.auth.login(this.user,this.pass).then(xuser=>{
      console.log("login is OK\n",xuser);
      this.isLogin=true;
      //update database
      const userdb=this.db.connect('users');
      if(!userdb) return console.log("*** ERR[1] ****\nfirestore is falure");
      console.log("TEST-001: here");
      const user={name:'Thanh',dept:'IM'};
      console.log("[TEST-005]: gonna add user");
      userdb.add(user).then(id=>{
        console.log("add user success, id:",id);
      })
      .catch(err=>console.log("**** ERR[2] ****\nadd user failure, err:",err))
    })
    .catch(err=>console.dir(err));
  }

  signout(){
    this.auth.logout().then(()=>{
      console.log("sign out");
      this.isLogin=false;
    })
  }


  async takeImage(){
    const {data,role}= await this.disp.showModal(CameraPage,{fix:false,ratio:3/2});
    if(role.toLowerCase()!='ok') return;
    console.log({image:data})
    this.image=data;
    // const base64=new Base64Handle(data);

  }

  //test upload image
  upload(){
    const PRG="upload"
    if(!this.image) return console.log("[%s] ERROR[1]: image is empty",PRG);
    this.storage.uploadImagebase64(this.image);
  }

}
