import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CheckData } from 'src/app/models/bookingInfor.model';
import { ConfigId, _DB_CONFIGS } from 'src/app/models/config';
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
  tool:CheckData;

  /** internal */
  backup:string;
  status:object={}
  statusList:string[]=[];
  addImages:UrlData[]=[];
  delImages:string[]=[];
  viewImages:UrlData[]=[];

  /** control */
  isAvailable:boolean=false;
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    this.backup=JSON.stringify(this.tool);
    const id:ConfigId='toolstatus'
    this.db.get(_DB_CONFIGS,id)
    .then(result=>{
      const {id,...status}=result
      this.status=status;
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
      images:this.tool.images,
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
      this.tool.images=data.images;
      this._refresh();
    })
  }

  /** edit page */
  done(role:ToolStatusPageRole='save'){
    const isChange=this.backup==JSON.stringify(this.tool)?false:true
    const out:ToolStatusPageOuts={
      tool:this.tool,
      isChange,
      addImages:this.addImages,
      delImages:this.delImages
    }
    this.modal.dismiss(out,role)
  }



  //////////////// background ///////////
  private _refresh(){
    this.viewImages=[...this.tool.images,...this.addImages];
    console.log("viewImages:",this);
  }

  /** calculae status */
  calcStatus():boolean{
    return Object.keys(this.tool.status).every(key=>this.tool.status[key]==0)
  }

}




/////////////// interface //////////////////

export type ToolStatusPageRole="cancel"|"save"
/**
 * input prarameters
 * @param tool CheckData
 * @param addImages images will add to status
 * @param delImages iamges will delete
 */
export interface ToolStatusPageOpts{
  tool:CheckData;
  addImages?:UrlData[];
  delImages?:string[];
}

/**
 * output for ToolStatusPage
 * @param tool CheckData
 * @param isChange true= already edit data
 */
export interface ToolStatusPageOuts{
  tool:CheckData;
  addImages:UrlData[];
  delImages:string[];
  isChange:boolean;
}
