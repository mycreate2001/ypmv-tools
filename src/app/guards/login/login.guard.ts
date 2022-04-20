import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/firebase/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private auth:AuthService,
    private router:Router
  ){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log("check login");
    return this.auth.getUser()
    .then(user=>{
      console.log("001. full fill user",{user})
      if(!user) {
        this.router.navigateByUrl("/login");
        // console.log("login falure",{user})
        return false;
      }
      return true
    })
    .catch(err=>{
      console.log("error ",{err})
      this.router.navigateByUrl("/login");
      return false
    })
  }
  
}
