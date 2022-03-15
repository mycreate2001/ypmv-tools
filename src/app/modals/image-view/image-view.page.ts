import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DisplayService } from 'src/app/services/display/display.service';
import { CameraPage } from '../camera/camera.page';
import { MenuData } from '../menu/menu.page';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.page.html',
  styleUrls: ['./image-view.page.scss'],
})
export class ImageViewPage implements OnInit {
  /** variable */
  images:string[]=[]; //cloud
  addImages:string[]=[];//new image
  delImages:string[]=[];
  isEdit:boolean=false;
  /** function */
  constructor(
    private modal:ModalController,
    private disp:DisplayService
  ) { }

  ngOnInit() {
  }

  done(role:string="OK"){
    const data={addImages:this.addImages,delImages:this.delImages,images:this.images}
    this.modal.dismiss(data,role)
  }

  add(){
    this.disp.showModal(CameraPage,{ratio:16/9})
    .then(camera=>{
      if(camera.role.toUpperCase()!='OK') return;
      this.addImages.push(camera.data)
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
            this.delImages.push(this.images[pos]);
            this.images.splice(pos,1);
          }
        }
      }
    ];
    this.disp.showMenu(event,{menus})
  }

}
