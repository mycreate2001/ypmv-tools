import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {  getStorage,uploadString,ref,
          getDownloadURL,listAll,deleteObject,
          uploadBytesResumable,
          FirebaseStorage,          } from 'firebase/storage';
// import { Base64 } from 'src/app/share/base64';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage:FirebaseStorage
  constructor() {
    const app=initializeApp(environment.firebaseConfig);
    this.storage=getStorage(app);
  }

  /** upload general file 
   * @example const result=upload(data,'general/test.pdf')
  */
  upload(data,path:string){
    return uploadBytesResumable(ref(this.storage,path),data)
  }

  /** upload image from base64 */
  uploadImagebase64(base64,path="images/"){
    // const {contentType,data}= new Base64(base64);
    // if(path.endsWith("/")) path+=(new Date()).getTime()+".jpg"
    // return uploadString(ref(this.storage,path),data,'base64',{contentType})
  }

  /** delete file
   * @example delete('images/test.jpg');
   */
  delete(path:string){
    return deleteObject(ref(this.storage,path))
  }

  getURL(path:string){
    return getDownloadURL(ref(this.storage,path))
  }

  /** get list folders, files
   * @example const [folders,files]=getList('/');
   */
  getList(path:string){
    return listAll(ref(this.storage,path))
    .then(res=>{
      const folders=res.prefixes.map(x=>x.fullPath);
      const files=res.items.map(x=>x.fullPath);
      return [folders,files]
    })
  }
}
