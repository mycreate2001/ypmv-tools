"use strick"
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {  getStorage,uploadString,ref,
          getDownloadURL,listAll,deleteObject,
          uploadBytesResumable, FirebaseStorage,
          UploadResult,          } from 'firebase/storage';
import { UrlData, createUrlData } from 'src/app/interfaces/urldata.interface';
import { Base64 } from 'src/app/utils/base64';
import { environment } from 'src/environments/environment';

export interface UploadImageResult extends UploadResult{
  url:string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage:FirebaseStorage=null;
  constructor() {
    const app=initializeApp(environment.firebaseConfig);
    this.storage=getStorage(app);
    console.log("\n*** storage init *** \n",{storage:this.storage})
  }

  /** upload general file 
   * @example const result=upload(data,'general/test.pdf')
  */
  upload(data,path:string){
    return uploadBytesResumable(ref(this.storage,path),data)
  }

  // /** upload images to folder */
  // uploadImages(images:(UrlData|string)[]|string|UrlData,path:string):Promise<UrlData[]|string[]>{
  //   if(!path.endsWith("/")) path=path+"/";
  //   const _images:any[]=[].concat(images);
  //   return new Promise((resolve,reject)=>{
  //     if(!images||!_images.length) return resolve([]);//
  //     const all=_images.map(image=>{
  //       if(typeof image=='string') return this.uploadImagebase64(image,path).then(result=>result.url)
  //       return this.uploadImagebase64(image.url,path).then(result=>{return{ url:result.url,caption:image.caption}})
  //     })
  //     Promise.all(all).then((results:string[]|UrlData[])=>resolve(results))
  //     .catch(err=>reject(err))
  //   })
  // }

   /** upload images to folder */
   uploadImages(images:UrlData[]|string[]|UrlData|string,path:string):Promise<UrlData[]>{
    if(!path.endsWith("/")) path=path+"/";
    const _images=[].concat(images);
    return new Promise((resolve,reject)=>{
      if(!images||!_images.length) return resolve([]);//
      const all=_images.map(image=>{
        const _image:UrlData=createUrlData(image);
        const pImage=this.uploadImagebase64(_image.url,path)
        const pThumbnail=this.uploadImagebase64(_image.thumbnail,path)
        return Promise.all([pImage,pThumbnail]).then(([url,thumbnail])=>createUrlData({url,thumbnail,caption:_image.caption?_image.caption:""}))
      })
      Promise.all(all).then((results)=>resolve(results))
      .catch(err=>reject(err))
    })
  }

  /**
   * 
   * @param base64 base64 from crop-image, eg:"data:image/png;base64,iVBORw0KGgoAAAANSU"
   * @param path folder & file name of image, default is "images/" if path="<folder>/" filename automatic create
   * @returns Promise<any>
   */
  uploadImagebase64(base64:string,path="images/"):Promise<string>{
    return new Promise((resolve,reject)=>{
      if(!base64) return resolve('');                   //empty
      if(base64.startsWith("https://")) return base64;  //already upload
      const {contentType,data}= new Base64(base64);
      if(path.endsWith("/")) path+=(new Date()).getTime()+Math.random().toString(36).substring(2,10)+".jpg"      //auto create filename as jpg
      uploadString(ref(this.storage,path),data,'base64',{contentType})
      .then(result=>resolve(this.getURL(result.ref.fullPath)))
    })
    
  }

  /** delete file
   * @example delete('images/test.jpg');
   */
  delete(url:string){
    const storage=getStorage();
    return deleteObject(ref(storage,url))
  }

  getURL(path:string){
    return getDownloadURL(ref(this.storage,path))
  }

  getPathFromUrl(url:string):string{
    return ref(this.storage,url).fullPath
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

export function getUpdateImages(images:(UrlData|string)[],oldImages:(string|UrlData)[]=[]):{currImages:UrlData[],addImages:UrlData[],delImages:string[]}{
  const addImages:UrlData[]=[];
  const delImages:string[]=[];
  const currImages:UrlData[]=[];
  //find new images
  const newImages=images.map(img=>{
    const url:UrlData=createUrlData(typeof img=='string'?{url:img}:img)
    if(!url.url.startsWith('http')) addImages.push(url);
    else currImages.push(url);
    return url.url;
  })
  //find delete images
  oldImages.forEach(img=>{
    const url=createUrlData(typeof img=='string'?{url:img}:img)
    if(!newImages.includes(url.url)) {
      delImages.push(url.url);
      if(url.thumbnail) delImages.push(url.thumbnail)
    }
  })
  return {addImages,delImages,currImages}
}