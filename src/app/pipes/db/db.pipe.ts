import { Pipe, PipeTransform } from '@angular/core';
import { _DB_USERS } from 'src/app/models/user.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
const DB_ERROR="(ERROR)"
const NO_IMAGE="../../../assets/image/no-image.png"
@Pipe({
  name: 'db'
})
export class DbPipe implements PipeTransform {
  constructor(private db:FirestoreService){}
  transform(id:string,tbl:string=_DB_USERS,template:string='%name%'):Promise<any> {
    const origin=template
    return new Promise((resolve,reject)=>{
      if(!id || !tbl) return reject(new Error('id or tbl is error'))
      this.db.get(tbl,id).then(result=>{
        // Object.keys(result).forEach(key=>{
        //   template=template.replace(new RegExp(`%${key}%`,'g'),result[key])
        // })
        // template=template.replace(/\[/g,"<");
        // template=template.replace(/\]/g,">");
        // // template=template.replace(new RegExp("]","g"),">");
        // console.log("test",{id,tbl,template,origin,this:this})
        // return resolve(template)
        return resolve(result)
      })
      .catch(err=>reject(err))
    })
    
  }

}
