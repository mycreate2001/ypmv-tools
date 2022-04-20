import { Injectable } from '@angular/core';
import { initializeApp} from 'firebase/app';
import { Auth,getAuth,
         signInWithEmailAndPassword,
         createUserWithEmailAndPassword,
         sendEmailVerification,signOut,
         User,onAuthStateChanged, UserCredential, Unsubscribe                      } from 'firebase/auth'
import { UserData } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';
import { DisplayService } from '../display/display.service';
import { FirestoreService } from './firestore.service';
const _DB_USER="users"
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  unsubcribe:Unsubscribe;
  auth:Auth;
  currentUser:UserData=null;
  constructor(
    private db:FirestoreService,
    private disp:DisplayService
  ) {
    const app=initializeApp(environment.firebaseConfig);
    this.auth=getAuth(app);
    // connectAuthEmulator(this.auth,'http://localhost:9099');//emulator
    this.unsubcribe=this.onAuthStatusChange((user)=>this.currentUser=user)
  }

  /**
   * 
   * @param email email must include '@' & '.', not empty
   * @param pass not empty, length >=8
   * @returns user data
   */
  login(email:string,pass:string):Promise<UserCredential>{
    return new Promise((resolve,reject)=>{
      //check password
      if(!pass || pass.length<6) return reject(new Error('password invalid'))
      //check email
      if(!email || !email.includes('@') || !email.includes('.')) return reject(new Error("email invalid"))
      signInWithEmailAndPassword(this.auth,email,pass)
      .then(data=>{
        if(!data.user.emailVerified) {
          const err=new Error("Your account is not yet verify by email")
          this.disp.msgbox(`${err.message}<br>Do you want to re-send verification email?`,
            {
              buttons:[
                'cancel',
                {
                  text:'Send',handler:()=>{
                    console.log("send verification email");
                    sendEmailVerification(data.user).then(result=>{
                      console.log("send verification email successfully\n",result)
                    })
                    .catch(err=>console.log("send verification email failured\n",err))
                  }
                }
              ]
            }
          )
          return reject(err);
        }
        return resolve(data);
      })
      .catch(err=>reject(err))
    })
  }

  /** logout */
  logout(){
    return signOut(this.auth)
  }

  /**
   * event when user status change
   * @param cb handler when login/signout
   * @param errHandler handler when error
   * @returns monitor
   */
  onAuthStatusChange(cb:{(user:UserData):any},errHandler?:{(err:Error):any}):Unsubscribe{
    return onAuthStateChanged(this.auth,
      auth=>{
        if(!auth) return cb(null);
        const id=auth.uid;
        this.db.get(_DB_USER,id)
        .then((user:UserData)=>{
          cb(user)
        })
        .catch(err=>{errHandler&&errHandler(err)})
      },
      err=>{if(errHandler) errHandler(err)}
    )
  }

  /** get user */
  getUser():Promise<User>{
    return new Promise((resolve,reject)=>{
      this.unsubcribe= onAuthStateChanged(this.auth,
        user=>{
          if(!user) {
            this.currentUser=null;
            return reject(new Error("not yet login"))
          };
          const id=user.uid;
          this.db.get(_DB_USER,id)
          .then(data=>{
            this.currentUser=data;
            return resolve(user)
          })
          .catch(err=>reject(err))
        },
        err=>reject(err),
        ()=>{
          this.unsubcribe();
          console.log("monitor unsubcribe",this);
        }
      )
    })
  }

  /** register */
  register(email:string,pass:string):Promise<UserCredential>{
    return new Promise((resolve,reject)=>{
      //verify password
      if(!pass ||pass.length<6 ) return reject(new Error('invalid password'));
      //email
      if(!email ||!email.includes('@')|| !email.includes('.')) return reject(new Error('invalid email'))
      createUserWithEmailAndPassword(this.auth,email,pass)
      .then(data=>{
        console.log("send verification email");
        sendEmailVerification(data.user);
        return resolve(data);
      })
      .catch(err=>reject(err))
    })
  }
}

export interface ValidData{
  name:string;
  include?:string;
  exclude?:string;
  min?:number;
  max?:number;
}
