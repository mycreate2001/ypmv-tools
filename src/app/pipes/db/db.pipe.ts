import { Pipe, PipeTransform } from '@angular/core';
import { _DB_USERS } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
@Pipe({
  name: 'db'
})
export class DbPipe implements PipeTransform {
  constructor(private db:FirestoreService){}
  transform(id:string,tbl:string=_DB_USERS):Promise<any> {
    return new Promise((resolve,reject)=>{
      if(!id || !tbl) return resolve(null)
      this.db.get(tbl,id).then(result=>resolve(result))
      .catch(err=>resolve(null))
    })
  }

}
