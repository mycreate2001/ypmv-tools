import { Injectable } from '@angular/core';
import { AuthService } from '../firebase/auth.service';
import { FirestoreService } from '../firebase/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  _db:any={}
  constructor(
    private db:FirestoreService,
    private auth:AuthService
  ) { }

  connect(tbl:string){
    const keys=Object.keys(this._db);
    if(keys.indexOf(tbl)==-1) {
      //connect new table
      const db=this.db.connect(tbl);
      if(db){
        this._db[tbl]=db;
      }
    }
  }
}
