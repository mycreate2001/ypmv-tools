import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

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
  constructor(
      private auth:AuthService,
      private router:Router,
      private disp:DisplayService
  ) { }

  ngOnInit() {
  }

  login(){
    this.msg=""
    this.auth.login(this.email,this.pass)
    .then(data=>{
      console.log("login successfully\n",data);
      this.router.navigateByUrl("/");
    })
    .catch(err=>{
      console.log("login failured!\n",err);
      // this.disp.msgbox("login falured<br>"+err.message,{header:'Login'});
      this.msg=err.message;
    })
  }

  register(){
    this.msg='';
    if(!this.email.toUpperCase().includes("@YAMAHA.")) 
    this.auth.register(this.email,this.pass)
    .then(data=>{
      this.router.navigateByUrl("/main/profile");
    })
    .catch(err=>{
      this.msg=err.message
    })
  }

}
