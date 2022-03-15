import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
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
  aspectRatio:number=4/3;
  fix:boolean=true;
  /** functions */
  constructor(private modal:ModalController) {
    console.log("this:",this);
  }

  takeImage(){
    const image=Camera.getPhoto({
      quality:90,
      allowEditing:true,
      resultType:CameraResultType.Uri,
      source:CameraSource.Camera
    })
    .then(image=>{
      this.image=image.webPath
    })
    .catch(err=>{
      this.close(false);
    })
  }

  loadImageFailed(){
    console.log("*** ERROR *** load image failed")
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

  close(isDone:boolean=true){
    if(!isDone) return this.modal.dismiss(null,"cancel");
    this.modal.dismiss(this.croppedImage,"OK");
  }


}
