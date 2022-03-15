import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilePage } from 'src/app/modals/profile/profile.page';
import { createUserData, UserData } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
// import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
const _DB_USER="users"
const _STORAGE_AVATAR="avatars"
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  /** variable */
  email:string='';
  pass:string='';
  msg:string='';
  isRegister:boolean=false;
  constructor(
      private auth:AuthService,
      private router:Router,
      private db:FirestoreService,
      private disp:DisplayService,
      private storage:StorageService
  ) { }

  ngOnInit() {
  }

  /** login  */
  login(){
    this.msg=""
    this.auth.login(this.email,this.pass)
    .then(data=>{
      console.log("login successfully\n",data);
      this.router.navigateByUrl("/");
    })
    .catch(err=>{
      console.log("login failured!\n",err);
      this.msg=err.message;
    })
  }

  /** register a new user */
  register(){
    this.msg='';
    if(!this.email.toUpperCase().includes("@YAMAHA.")) 
    this.auth.register(this.email,this.pass)
    .then(data=>{
      const id=data.user.uid;
      const email=data.user.email
      const user=createUserData({id,email});
      //add user default
      return this.db.add(_DB_USER,user)
      .then(()=>user)
    })
    //edit profile
    .then((user)=>{
      this.disp.showModal(ProfilePage,{isEdit:true,user})
      this.router.navigateByUrl("/");
    })
    .catch(err=>{
      this.msg=err.message;
    })
    
  }

}
