import { Component } from '@angular/core';
import { AuthService } from '../services/firebase/auth.service';
import { FirestoreService } from '../services/firebase/firestore.service';

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
  constructor(private auth:AuthService,private db:FirestoreService) {}
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

}
