import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData } from 'src/app/models/basic.model';
import { ConfigId, StatusConfig, _CONFIG_STATUS_ID, _DB_CONFIGS } from 'src/app/models/config';
import { StatusInf, ToolStatus, _STATUS_NG, _STATUS_NOTYET, _STATUS_OK } from 'src/app/models/status-record.model';
// import { CheckData, OrderDataStatusType } from 'src/app/models/order.model';
// import { statusList } from 'src/app/models/tools.model';
import { createUrlData, MenuData, UrlData } from 'src/app/models/util.model';
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
  tool:BasicData;     //Tool/cover information
  status:ToolStatus

  /** internal */
  // ARTER_LIST:OrderDataStatusType[]=['renting','returned'];
  // BEFORE_LIST:OrderDataStatusType[]=['approved']
  backup:string[]=[];
  statusDb:object={}        //get status list from DB
  statusList:string[];
  viewImages:UrlData[]=[];
  isChange:boolean=false;
  statusconfigs:StatusConfig[]=[];

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

    //get config
    const statusConfigDb=this.db.get(_DB_CONFIGS,_CONFIG_STATUS_ID);
    Promise.all([statusConfigDb]).then(([statusConfigs])=>{
      /** statusConfig=[{key:'visual',order:1,list:['scratch','crack']}] */
      this.statusconfigs=statusConfigs;
      this.statusconfigs=this.statusconfigs.sort((a,b)=>a.order-b.order);
      this.statusList=this.statusconfigs.map(stt=>stt.key);
      this.refresh();
      this.isAvailable=true;
    })
    // const id:ConfigId='toolstatus'
    // this.db.get(_DB_CONFIGS,id)
    // .then(result=>{
    //   const {id,...status}=result
    //   this.statusDb=status;
    //   this.refresh();
    //   this.isAvailable=true;
    //   console.log("init",this);
    // })
  }

  /////////////// BUTTONS HANDLER /////////////////////
  getStatus(){
    const status=this.status.status;
    const notResult=status.every(stt=>stt.value==_STATUS_NOTYET.value);//not yet
    const okResult=status.every(stt=>stt.value==_STATUS_OK.value);
    return notResult?_STATUS_NOTYET.key:okResult?_STATUS_OK.key:_STATUS_NG.key
  }

  /** show option for images */
  showImageOption(event:any,pos:number,process:'beforeImages'|'afterImages', type:'local'|'db'='db'){
    // const menus:MenuData[]=[
    //   {
    //     name:'Delete',icon:'trash',iconColor:'danger',
    //     handler:()=>{
    //       if(type=='db'){
    //         this.delImages.push(this.tool[process][pos].url)
    //         this.tool[process].splice(pos,1)
    //       }else{
    //         this.addImages.splice(pos,1)
    //       }
    //     }
    //   }
    // ]
    // this.disp.showMenu(event,{menus})
    // .then(result=>{
    //   this.refresh()
    // })
  }

  /** take image */
  takeImage(){
    const props:CameraPageOpts={fix:true,aspectRatio:4/3}
    this.disp.showModal(CameraPage,props)
    .then(result=>{
      const role=result.role as CameraPageRole;
      if(role!='ok') return;
      const data=result.data as CameraPageOuts
      // this.addImages.push(createUrlData({url:data.image}))
      this.status.images.push(createUrlData({url:data.image}))
      this.refresh();
    })
  }

  /** show/edit images */
  showImage(){
    const props:ImageViewPageOpts={
      addImages:this.status.images,
      canCaption:true
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      const role=result.role as ImageViewPageRole;
      if(role!=='ok') return;
      const data=result.data as ImageViewPageOuts;
      // this.addImages=data.addImages;
      // this.delImages=data.delImages;
      this.status.images=[...[].concat(data.images),data.images]
      this.refresh();
    })
  }

  /** edit page */
  done(role:ToolStatusPageRole='save'){
    const out:ToolStatusPageOuts={
      status:this.status
    }
    this.modal.dismiss(out,role)
  }



  //////////////// background ///////////
  refresh(){
    //check change data
    this.isChange=_BACKUP_LIST.every((key,pos)=>this.backup[pos]==JSON.stringify(this[key]))?false:true
    //onsole.log("viewImages:",this);
    this.viewImages=this.status.images;
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
  tool:BasicData;   // [tool/box] information
  status:ToolStatus;
}

/**
  @param tool BasicData;
  @param status ToolStatus
  @param addImages UrlData[];
  @param delImages string[];
  @param isChange boolean;
 */
export interface ToolStatusPageOuts{
  status:ToolStatus;
}
