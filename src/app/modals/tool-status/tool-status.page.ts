import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData } from 'src/app/models/basic.model';
import { CheckData } from 'src/app/models/bookingInfor.model';
import { ConfigId, _DB_CONFIGS } from 'src/app/models/config';
import { createToolData, createToolStatus, ToolData, ToolStatus } from 'src/app/models/tools.model';
import { UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts, ImageViewPageRole } from '../image-view/image-view.page';

@Component({
  selector: 'app-tool-status',
  templateUrl: './tool-status.page.html',
  styleUrls: ['./tool-status.page.scss'],
})
export class ToolStatusPage implements OnInit {
  /** input */
  tool:BasicData;
  images:UrlData[]=[];
  addImages:UrlData[]=[];
  delImages:string[]=[];

  /** internal */
  backup:string;
  status:ToolStatus=createToolStatus();
  statusDb:object={}
  statusList:string[]=[];
  viewImages:UrlData[]=[];

  /** control */
  isAvailable:boolean=false;
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    this.backup=JSON.stringify(this.status)+JSON.stringify(this.addImages)+JSON.stringify(this.images);
    const id:ConfigId='toolstatus'
    this.db.get(_DB_CONFIGS,id)
    .then(result=>{
      const {id,...status}=result
      this.statusDb=status;
      this.statusList=Object.keys(status);
      
      this._refresh();
      this.isAvailable=true;
      console.log("init",this);
    })
  }

  /////////////// BUTTONS HANDLER /////////////////////
  /** show/edit images */
  showImage(){
    const props:ImageViewPageOpts={
      images:this.images,
      addImages:this.addImages,
      delImages:this.delImages,
      canCaption:true
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      const role=result.role as ImageViewPageRole;
      if(role!=='ok') return;
      const data=result.data as ImageViewPageOuts;
      this.addImages=data.addImages;
      this.delImages=data.delImages;
      this.images=data.images;
      this._refresh();
    })
  }

  /** edit page */
  done(role:ToolStatusPageRole='save'){
    const json=JSON.stringify(this.status)+JSON.stringify(this.addImages)+JSON.stringify(this.images);
    const isChange=this.backup==json?false:true
    const out:ToolStatusPageOuts={
      tool:this.tool,
      status:this.status,
      isChange,
      addImages:this.addImages,
      delImages:this.delImages,
      images:this.images
    }
    this.modal.dismiss(out,role)
  }



  //////////////// background ///////////
  private _refresh(){
    this.viewImages=[...this.images,...this.addImages];
    console.log("viewImages:",this);
  }

  /** calculae status */
  calcStatus():boolean{
    return Object.keys(this.status).every(key=>this.status[key]==0)
  }

}




/////////////// interface //////////////////

export type ToolStatusPageRole="cancel"|"save"
/**
 * input prarameters
 * @param tool CheckData
 * @param status current status
 * @param addImages images will add to status
 * @param delImages iamges will delete
 * @param images  current images
 */
export interface ToolStatusPageOpts{
  tool:BasicData;
  status?:ToolStatus;
  addImages?:UrlData[];
  delImages?:string[];
  images?:UrlData[];
}

/**
  @param tool BasicData;
  @param status ToolStatus
  @param addImages UrlData[];
  @param delImages string[];
  @param isChange boolean;
 */
export interface ToolStatusPageOuts{
  /** tool id */
  tool:BasicData;
  /** status of tool */
  status:ToolStatus;
  /** new images */   
  addImages:UrlData[];
  /** image will delete */
  delImages:string[];
  /** already change or not */
  isChange:boolean;
  /** current images */
  images:UrlData[];
}
