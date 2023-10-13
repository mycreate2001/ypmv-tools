import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { DisplayService } from 'src/app/services/display/display.service';
import { CameraPage, CameraPageOpts, CameraPageOuts, CameraPageRole } from '../camera/camera.page';
import { UrlData, createUrlData } from 'src/app/interfaces/urldata.interface';
import { MenuData } from 'src/app/interfaces/util.model';

/**
 * input of ImageViewPage
 * @param images  current images
 * @param addImages images will add (temporary on local)
 * @param delImages images want to delete, but not yet delete
 * @param canCaption true=image with caption
 */
export interface ImageViewPageOpts{
  /** main image from sourse */
  images:UrlData[];
  /** deleted url, it not save to db */
  delImages?:string[]           
  /** default=false, can add capture to image */
  canCaption?:boolean;
  isFixRatio?:boolean;      
}

export interface CompressImageOpts{
  orientation?:DOC_ORIENTATION;
  ratio?: number
  quality?: number
  maxWidth?: number
  maxHeight?: number
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
  images:UrlData[];
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
  images:UrlData[]=[];     // get from input
  delImages:string[]=[];
  canCaption:boolean=false;
  isFixRatio:boolean=true;
 
  /** internal variable */
  /** function */
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private imageCompress:NgxImageCompressService
  ) { }
  
  compressImage(image:string,opts:CompressImageOpts={}){
    const orientation=opts.orientation
    const ratio=opts.ratio
    const quality=opts.quality
    const maxWidth=opts.maxWidth
    const maxHeight=opts.maxHeight
    return this.imageCompress.compressFile(image,orientation,ratio,quality,maxWidth,maxHeight)
  }

  ngOnInit() {
    if(!this.images.length) this.add();
  }


  /** exit page */
  done(role:ImageViewPageRole="ok"){
    const out:ImageViewPageOuts={
      images:this.images,
      delImages:this.delImages
    }
  
    this.modal.dismiss(out,role)
  }

  /** add more image */
  add(){
    const props:CameraPageOpts={
      fix:this.isFixRatio
    }
    this.disp.showModal(CameraPage,props)
    .then(camera=>{
      const role=camera.role as CameraPageRole
      if(role!=='ok') return;
      const data=camera.data as CameraPageOuts
      return this.compressImage(data.image,{maxWidth:300})
      .then(thumbnail=>createUrlData({url:data.image,thumbnail}))
      .then(image=>{
        this.images.push(image)
        console.log("\n*** Images ***\n",this.images);
      })
    })
   
  }

  /** MENU */
  menu(event,pos:number){
    const menus:MenuData[]=[
      {
        name:'Delete',icon:'trash',iconColor:'danger',
        handler:()=>{
          const image=this.images[pos];
          if(!image) return;
          if(image.url.startsWith('https://')){
            this.delImages.push(image.url);
            if(image.thumbnail) this.delImages.push(image.thumbnail)
          }
          this.images.splice(pos,1);
        }
      }
    ];
    this.disp.showMenu(event,{menus})
  }

}
