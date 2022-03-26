import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MenuData, UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { CameraPage, CameraPageOuts } from '../camera/camera.page';

/**
 * input of ImageViewPage
 * @param images  current images
 * @param addImages images will add (temporary on local)
 * @param delImages images want to delete, but not yet delete
 * @param canCaption true=image with caption
 */
export interface ImageViewPageOpts{
  /** main image from sourse */
  images?:(string|UrlData)[]     
  /** added Images, default=[] */
  addImages?:(string|UrlData)[]  
  /** deleted url, it not save to db */
  delImages?:string[]           
  /** default=false, can add capture to image */
  canCaption?:boolean;        
}

export type ImageViewPageRole="ok"|"cancel"

/**
 * output of ImageViewPage
 * @param images  image will update
 * @param addImages image will add (local)
 * @param  delImages image will delete (from cloud)
 */
export interface ImageViewPageOuts{
  /** images from sourse */
  images:(string|UrlData)[];
  /** added images */
  addImages:(string|UrlData)[];
  /** url of delete image */
  delImages:string[];
}

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.page.html',
  styleUrls: ['./image-view.page.scss'],
})
export class ImageViewPage implements OnInit {
  /** input */
  images:UrlData[]=[];     //cloud
  addImages:UrlData[]=[];//new image
  delImages:string[]=[];
  canCaption:boolean=false;
 
  /** internal variable */
  /** function */
  constructor(
    private modal:ModalController,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    if(!this.images.length) this.add();
    this.images=this.images.map(image=>{
      if(typeof image=='string') return {url:image,caption:''}
      return image;
    })
    this.addImages=this.addImages.map(image=>{
      if(typeof image=='string') return {url:image,caption:''}
      return image
    })
  }


  /** exit page */
  done(role:ImageViewPageRole="ok"){
    const out:ImageViewPageOuts={
      addImages:this.canCaption?this.addImages:this.addImages.map(x=>x.url),
      images:this.canCaption?this.images:this.images.map(x=>x.url),
      delImages:this.delImages
    }
  
    this.modal.dismiss(out,role)
  }

  /** add more image */
  add(){
    this.disp.showModal(CameraPage)
    .then(camera=>{
      if(camera.role.toUpperCase()!='OK') return;
      const data=camera.data as CameraPageOuts
      this.addImages.push({url:data.image,caption:''})
    })
  }

  menu(event,pos:number,isNewImage:boolean=false){
    const menus:MenuData[]=[
      {
        name:'Delete',icon:'trash',iconColor:'danger',
        handler:()=>{
          if(isNewImage){
            this.addImages.splice(pos,1)
          }
          else{
            const image=this.images[pos];
            if(typeof image=='string') this.delImages.push(image)
            else this.delImages.push(image.url)
            this.images.splice(pos,1);
          }
        }
      }
    ];
    this.disp.showMenu(event,{menus})
  }

}
