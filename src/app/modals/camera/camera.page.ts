import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
export interface CameraPageOpts{
  /** default=4/3 */
  aspectRatio?:number  //default=4/3
  /** default=true */
  fix?:boolean;        // fix aspect ratio, default=true
}

/**
 *@param image:base64
 */
export interface CameraPageOuts{
  image:string;//base64
}
export type CameraPageRole="cancel"|"ok"|"error"

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
  rotation:number=0;
  transform:ImageTransform={}
  /** functions */
  constructor(private modal:ModalController) {
    console.log("this:",this);
  }
  private _afterRotating(){
    const flipH=this.transform.flipH;
    const flipV=this.transform.flipV;
    this.transform={
      ...this.transform,
      flipH:flipV,
      flipV:flipH
    }
  }
  takeImage(){
    Camera.getPhoto({
      quality:90,
      allowEditing:true,
      resultType:CameraResultType.Uri,
      source:CameraSource.Camera
    })
    .then(image=>{
      this.image=image.webPath
    })
    .catch(err=>{
      this.done('error');
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

  turnImage(){
    this.rotation--;
    this._afterRotating();
    console.log("rotation:",this.rotation);

  }

  ngOnInit() {
    this.takeImage();
    // console.log("image:",this.image);
  }


  /** finish camera */
  done(role:CameraPageRole="ok"){
    const out:CameraPageOuts={
      image:this.croppedImage
    }
    this.modal.dismiss(out,role);
  }


}

