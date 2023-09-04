import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createBasicItem } from 'src/app/interfaces/basic-item.interface';
import { MchModel, _DB_MCH_MODEL, createMchModel } from 'src/app/interfaces/mch-model';
import { createSaveInfor } from 'src/app/interfaces/save-infor.model';
import { UrlData } from 'src/app/interfaces/urldata.interface';
import { UserData } from 'src/app/interfaces/user.model';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service-2';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts, ImageViewPageRole } from '../image-view/image-view.page';
import { DisplayService } from 'src/app/services/display/display.service';
const _BACKUP_LIST='model,isImage'.split(",")
@Component({
  selector: 'app-mch-model',
  templateUrl: './mch-model.page.html',
  styleUrls: ['./mch-model.page.scss'],
})
export class MchModelPage implements OnInit {
  /** input */
  modelId?:string;
  model?:MchModel;

  /** inside variable */
  private _backupStr:string[]=[];
  isImage:boolean=false;
  isAvailable:boolean=false;
  type:'new'|'exist'|'not exist'|'not update'='not update';
  viewImages:UrlData[]=[];  // for all Images
  delImages:string[]=[];    // will delete images

  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
    ) { }

  async ngOnInit() {
    console.log("current user:",this.auth.currentUser);
    const model=await this.getMchModel();
    if(model) this.model=JSON.parse(JSON.stringify(model));
    //have data
    this._backupStr=_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
    this._refreshImages();
    console.log(" **** mch-model/init **** \n",this);
  }

  ////////// BUTTONS   /////////////
  done(role:MchModelPageRole='ok'){
    if(role!=='ok') return this.modal.dismiss(null,role)
    //ok
    const out:MchModelPageOutput={
      model:JSON.parse(JSON.stringify(this.model))
    }
    this.modal.dismiss(out,role)
  }

  /** edit Images */
  async detailImage(){
    const props:ImageViewPageOpts={
      images:this.model.images,
      delImages:this.delImages,
      canCaption:true,
      isFixRatio:false
    }
    try{
      const result=await this.disp.showModal(ImageViewPage,props);
      const rule=result.role as ImageViewPageRole;
      if(rule!=='ok') return;
      //handle
      const data=result.data as ImageViewPageOuts;
      this.delImages=data.delImages;
      this.model.images=data.images;
      this._refreshImages();
    }
    catch(err){
      const msg=err instanceof Error?err.message:"other"
      console.warn("detail Image is error\n",msg);
    }
  }

  ////////// BACKGROUNDS ////////////

  /** refresh images */
  private _refreshImages(){
    this.viewImages=this.model.images
    this.isAvailable=true;
  }

  /**
   * The function "isUpdate" checks if the current state of an object has been updated since the last
   * backup.
   * @returns a boolean value. If the `_backupStr` property is equal to the stringified version of the
   * `_BACKUP_LIST` array, then it returns `false`. Otherwise, it returns `true`.
   */
  isUpdate():boolean{
    const str=_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
    if(this._backupStr===str) return false;
    return true;
  }

  /** getMchModel */
  async getMchModel():Promise<MchModel|undefined>{
    // new case
    if(!this.modelId && !this.model) {
      this.type='new';
      return this.generateNewMchModel();
    }
    if(this.modelId){
      const model:MchModel=await this.db.get(_DB_MCH_MODEL,this.modelId);
      if(model) {
        this.type='exist'
        return model
      }
      this.type='not exist'
      return;
    }
    this.type='exist'
    return this.model;
    
  }

  generateNewMchModel():MchModel{
    const cUser=this.auth.currentUser;
    console.log("step1 ",{cUser})
    const user=createBasicItem({...cUser,type:'users',image:cUser.image})
    console.log("step2 ",{user})
    const inf=createSaveInfor({user})
    console.log("step3 ",{inf})
    const model=createMchModel({...inf});
    console.log("step4 ",{model})
    return model;
  }

}


////////// INTERFACES ///////////////////
export type MchModelPageInput=MchModelPageInputId|MchModelPageInputData
export type MchModelPageRole='ok'|'back'|'error'
export interface MchModelPageOutput{
  model:MchModel
}

interface MchModelPageInputCommon{

}

// get MchModel from Id
interface MchModelPageInputId extends MchModelPageInputCommon{
  modelId:string;
}

// get MchModel direct from parents page
interface MchModelPageInputData extends MchModelPageInputCommon{
  model:MchModel
}

