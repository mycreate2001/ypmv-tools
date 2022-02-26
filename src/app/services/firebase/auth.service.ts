import { Injectable } from '@angular/core';
import { initializeApp} from 'firebase/app';
import { Auth,getAuth, connectAuthEmulator,
         signInWithEmailAndPassword,
         createUserWithEmailAndPassword,
         sendEmailVerification,signOut,
         User,onAuthStateChanged                      } from 'firebase/auth'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth:Auth;
  constructor() {
    const app=initializeApp(environment.firebaseConfig);
    this.auth=getAuth(app);
    connectAuthEmulator(this.auth,'http://localhost:9099');//emulator
  }

  /** login */
  login(email:string,pass:string){
    if(!email || !pass) return;// this.disp.showMsg({header:'Login',message:'email or password is empty'});
    return signInWithEmailAndPassword(this.auth,email,pass)
    .then(data=>{
      if(!data.user.emailVerified) throw new Error("not yet verify email");//@@@test
      return data;
    })
  }

  /** logout */
  logout(){
    return signOut(this.auth)
  }

  /** get user */
  getUser():Promise<User>{
    return new Promise(resolve=>{
      onAuthStateChanged(this.auth,user=>resolve(user))
    })
  }

  /** register */
  register(email:string,pass:string){
    return createUserWithEmailAndPassword(this.auth,email,pass)
    .then(data=>{
      console.log("send verification email");
      return sendEmailVerification(data.user);
    })
  }
}
