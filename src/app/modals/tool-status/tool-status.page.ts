import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BookingInforStatusType, CheckData } from 'src/app/models/bookingInfor.model';
import { ConfigId, _DB_CONFIGS } from 'src/app/models/config';
import { statusList } from 'src/app/models/tools.model';
import { MenuData, UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { CameraPage, CameraPageOpts, CameraPageOuts, CameraPageRole } from '../camera/camera.page';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts, ImageViewPageRole } from '../image-view/image-view.page';
const _BACKUP_LIST=['tool','addImages']
@Component({
  selector: 'app-tool-status',
  templateUrl: './tool-status.page.html',
  styleUrls: ['./tool-status.page.scss'],
})
export class ToolStatusPage implements OnInit {
  /** input */
  tool:CheckData;
  addImages:UrlData[]=[];
  delImages:string[]=[];
  status:BookingInforStatusType='created'

  /** internal */
  afterList:BookingInforStatusType[]=['renting','returned'];
  beforeList:BookingInforStatusType[]=['approved']
  backup:string[]=[];
  statusDb:object={}        //get status list from DB
  statusList=statusList;
  viewImages:UrlData[]=[];
  isChange:boolean=false;

  /** control */
  isAvailable:boolean=false;
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    //backup
    this.backup=_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
    const id:ConfigId='toolstatus'
    this.db.get(_DB_CONFIGS,id)
    .then(result=>{
      const {id,...status}=result
      this.statusDb=status;
      this.refresh();
      this.isAvailable=true;
      console.log("init",this);
    })
  }

  /////////////// BUTTONS HANDLER /////////////////////

  /** show option for images */
  showImageOption(event:any,pos:number,process:'beforeImages'|'afterImages', type:'local'|'db'='db'){
    const menus:MenuData[]=[
      {
        name:'Delete',icon:'trash',iconColor:'danger',
        handler:()=>{
          if(type=='db'){
            this.delImages.push(this.tool[process][pos].url)
            this.tool[process].splice(pos,1)
          }else{
            this.addImages.splice(pos,1)
          }
        }
      }
    ]
    this.disp.showMenu(event,{menus})
    .then(result=>{
      this.refresh()
    })
  }

  /** take image */
  takeImage(){
    const props:CameraPageOpts={fix:true,aspectRatio:4/3}
    this.disp.showModal(CameraPage,props)
    .then(result=>{
      const role=result.role as CameraPageRole;
      if(role!='ok') return;
      const data=result.data as CameraPageOuts
      this.addImages.push({caption:'',url:data.image})
      this.refresh();
    })
  }

  /** show/edit images */
  showImage(){
    const props:ImageViewPageOpts={
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
      this.refresh();
    })
  }

  /** edit page */
  done(role:ToolStatusPageRole='save'){
    const out:ToolStatusPageOuts={
      tool:this.tool,
      addImages:this.addImages,
      delImages:this.delImages,
    }
    this.modal.dismiss(out,role)
  }



  //////////////// background ///////////
  refresh(){
    //check change data
    this.isChange=_BACKUP_LIST.every((key,pos)=>this.backup[pos]==JSON.stringify(this[key]))?false:true
    //onsole.log("viewImages:",this);
    const images=this.status=='approved'?this.tool.beforeImages:
        this.status=='renting'?this.tool.afterImages:[]
    this.viewImages=[...images,...this.addImages]
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
  tool:CheckData;
  status:BookingInforStatusType;
  addImages?:UrlData[];
  delImages?:string[];
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
  tool:CheckData;
  /** status of tool */ 
  addImages:UrlData[];
  /** image will delete */
  delImages:string[];
}
