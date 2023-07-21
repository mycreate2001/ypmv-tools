import { Component } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { ProfilePage, ProfilePageOpts } from './modals/profile/profile.page';
import { CompanyData, _DB_COMPANY } from './interfaces/company.model';
import { UserData, _DB_USERS } from './interfaces/user.model';
import { PageData } from './interfaces/util.model';
import { DisplayService } from './services/display/display.service';
import { AuthService } from './services/firebase/auth.service';
import { FirestoreService } from './services/firebase/firestore.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent  {
  loading:Promise<HTMLIonLoadingElement>=null;
  /** function */
  constructor(private disp:DisplayService, public route:Router,private loadingCtr:LoadingController) {
    // this.route.events.subscribe(async ev=>{
    //   if(ev instanceof NavigationStart) {
    //     console.log("\n+++++ test-000:start")
    //     this.disp.showLoading("abc...");
    //   }
    //   if(ev instanceof NavigationCancel||ev instanceof NavigationEnd || ev instanceof NavigationError){
    //     console.log("\n+++++ test-001:finish")
    //     if(this.loadingCtr) this.loadingCtr.dismiss();
    //   }
    // })
  }


}
