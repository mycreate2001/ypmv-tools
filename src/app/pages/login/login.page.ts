import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilePage } from 'src/app/modals/profile/profile.page';
import { CompanyData, _DB_COMPANY } from 'src/app/models/company.model';
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
  name:string='';
  companyId:string=''
  list:any;
  msg:string='';
  isRegister:boolean=false;
  companies:CompanyData[]=[];
  constructor(
      private auth:AuthService,
      private router:Router,
      private db:FirestoreService,
      private disp:DisplayService,
      // private storage:StorageService
  ) { }

  ngOnInit() {
    this.db.search(_DB_COMPANY,[])
    .then((companies:CompanyData[])=>{
      this.companies=companies;
    })
  }

  ionViewDidEnter	(){
    this.list=document.querySelectorAll("app-login ion-input[role] input");
    this.list.forEach(l=>{
      l.addEventListener("blur",this.update)
    })
  }

  ionViewDidLeave(){
    this.list.forEach(l=>l.removeEventListener("blur",this.update))
  }

  update(){
    console.log("update");
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
      const msg:string=err.message;
      this.msg=msg.replace("Firebase:","")
    })
  }

  /** register a new user */
  register(){
    console.log("test",this);
    this.msg='';
    //all infor
    const list=['name','companyId','email','pass']
    if(!list.every(key=>this[key])) return this.disp.msgbox("missing infor")
    //check email
    if(!this.email.includes('@')) return this.disp.msgbox("invalid email, pls input again");
    const company=this.companies.find(c=>c.id==this.companyId);
    if(!company) return this.disp.msgbox("internal error");
    const emailExt=company.email.split('@')[1];
    if(emailExt.toUpperCase()!=this.email.split('@')[1].toUpperCase())
      return this.disp.msgbox(`wrong company<br>pls fill email as '${company.email}'`)
    this.auth.register(this.email,this.pass)
    .then(data=>{
      const id=data.user.uid;
      const email=data.user.email
      const user=createUserData({id,email,companyId:this.companyId,name:this.name});
      //add user default
      this.db.add(_DB_USER,user)
      .then(()=>{
        this.auth.logout();
        this.isRegister=false;
      })
    })
    .catch(err=>{
      this.msg=err.message;
    })
    
  }

}
