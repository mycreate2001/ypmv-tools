import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
})
export class CameraPage implements OnInit {
  /** variable */
  image:any;
  croppedImage:any;
  /** functions */
  constructor() { }

  async takeImage(){
    const image=await Camera.getPhoto({
      quality:90,
      allowEditing:true,
      resultType:CameraResultType.Uri,
      source:CameraSource.Camera
    })
    this.image=image.webPath;
    console.log("image:",this.image);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(){
    console.log("image load");
  }
  cropperReady(){
    console.log("crop ready now");
  }

  ngOnInit() {
    this.takeImage();
    // console.log("image:",this.image);
  }

  upload(event):Promise<void>{
    console.log("upload started");
    return new Promise((resolve,reject)=>{
      const file=event.files[0];
      if(!file) {console.log("cancel");return reject("cancel")}
      console.log("file:",file);
      return resolve(file);
    })
  }

}
