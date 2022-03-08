import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {  getStorage,uploadString,ref,
          getDownloadURL,listAll,deleteObject,
          uploadBytesResumable,
          FirebaseStorage,
          UploadResult,          } from 'firebase/storage';
import { Base64 } from 'src/app/utils/base64';
import { environment } from 'src/environments/environment';

export interface UploadImageResult extends UploadResult{
  url:string;
}

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

 
  /**
   * 
   * @param base64 base64 from crop-image, eg:"data:image/png;base64,iVBORw0KGgoAAAANSU"
   * @param path folder & file name of image, default is "images/" if path="<folder>/" filename automatic create
   * @returns Promise<any>
   */
  uploadImagebase64(base64:string,path="images/"):Promise<UploadImageResult>{
    return new Promise((resolve,reject)=>{
      if(!base64) return reject(new Error("image is empty"));
      const {contentType,data}= new Base64(base64);
      if(path.endsWith("/")) path+=(new Date()).getTime()+".jpg"      //auto create filename as jpg
      uploadString(ref(this.storage,path),data,'base64',{contentType})
      .then(async result=>{
        const url=await this.getURL(result.ref.fullPath);
        console.log("url2:",url);
        resolve({url,...result})
      })
      .catch(err=>reject(err))
    })
    
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