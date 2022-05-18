import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigId, _DB_CONFIGS } from 'src/app/models/config';
import { createModelData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS, _STORAGE_MODELS } from 'src/app/models/tools.model';
import { UserData } from 'src/app/models/user.model';
import { UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

import {  FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';

import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts } from '../image-view/image-view.page';
import { ToolPage, ToolPageOpts } from '../tool/tool.page';

const _BACKUP_LIST="model,addImages".split(",")
const _UPDATE_LIST="ion-text,ion-select,ion-input,ion-checkbox,ion-textarea"

@Component({
  selector: 'app-tool-detail',
  templateUrl: './model.page.html',
  styleUrls: ['./model.page.scss'],
})
export class ModelPage implements OnInit {
  /** database */
  tools:ToolData[]=[];      // can input or database
  groups:string[]=[];

  /** input */
  modelId:string;
  model:ModelData   //model data or modelId
  isEdit:boolean=false;

  /** internal */
  isAvailble:boolean=false;
  isChange:boolean=false;
  isNew:boolean=false;
  backup:string[];
  /** use internal only, it's for view */
  viewImages:UrlData[]=[];       //iamges wil add more to db
  addImages:UrlData[]=[];
  delImages:string[]=[];    //image will delete
  user:UserData;

  /** it's may get from database */
  statusList:object={}
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService,
    private storage:StorageService
  ) {

  }

  ngOnInit() { 
    console.log("INIT",this);
    this._getModel()
    .then(model=>{
      this.model=model;this.modelId=this.model.id
      const toolCtr= this.db.search(_DB_TOOLS,{key:'model',type:'==',value:model.id})
      const groupId:ConfigId='groups'
      const groupCtr:Promise<string[]>=this.db.get(_DB_CONFIGS,groupId);
      const statusId:ConfigId='toolstatus';
      const statusCtr=this.db.get(_DB_CONFIGS,statusId);
      Promise.all([toolCtr,groupCtr,statusCtr]).then(
        ([tools,_groups,_status])=>{
          this.tools=tools;
          this.groups=_groups['list']||[];
          this.statusList=_status;
          this.backup=this.isNew?[]:_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
          this._refreshView("initial");
        }
      )
    })
  }

  /** update view */
  ionViewDidEnter(){
    const nodeList=document.querySelector("app-tool-detail").querySelectorAll(_UPDATE_LIST)
    nodeList.forEach(node=>{
      node.addEventListener("ionChange",(e)=>{
        //this._refreshView("ionChange")
        this._refreshView()
      })
    })
  }

  /** check & get model data */
  private async _getModel():Promise<ModelData>{
    return new Promise((resolve,reject)=>{
      if(!this.model && !this.modelId){//new model
        this.tools=[];
        this.isNew=true;
        const userId:string=this.auth.currentUser.id;
        const companyId:string=this.auth.currentUser.companyId;
        return resolve(createModelData({userId,companyId}))
      }
      if(this.model) return resolve(this.model)
      return this.db.get(_DB_MODELS,this.modelId)
      .then((model:ModelData)=>resolve(model))
      .catch(err=>reject(err))
    })
  }

  private _refreshView(debug:string=""){
    //isChange
    this.isChange=_BACKUP_LIST.some((key,pos)=>this.backup[pos]!=JSON.stringify(this[key]))
    // viewImage
    this.viewImages=this.model.images.concat(this.addImages)
    this.isAvailble=true;
    if(debug) console.log("\ndebug:%s\n",debug,this);
  }

  ///////// exist ////////
  done(role:ModelPageRole="save"){
    const out:ModelPageOuts={
      addImages:this.addImages,
      delImages:this.delImages,
      model:this.model as ModelData
    }
    this.modal.dismiss(out,role)
  }

  ///////////////////// BUTTONS HANDLER ////////////////////////////
  /** add select group */
  selectGroup(){
    if(!this.model.group){
      this.disp.msgbox("input new group name",
        {
          inputs:[{type:'text'}],
          buttons:[
            {role:'OK',text:'OK'}
          ]
        }
      ).then(result=>{
        console.log(result);
        if(result.role.toUpperCase()!="OK") return;
        const newGroup=result.data.values[0];
        this.model.group=newGroup
        this.groups.push(newGroup)
        const id:ConfigId='groups'
        const data={id,list:this.groups}
        this.db.add(_DB_CONFIGS,data)
      })
    }
  }

  /** view / edit images */
  detailImage(){
    if(typeof this.model=='string') return;
    const props:ImageViewPageOpts={
      images:this.model.images,
      delImages:this.delImages,
      addImages:this.addImages
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      if(result.role.toUpperCase()!='OK') return;
      const data=result.data as ImageViewPageOuts;
      if(typeof this.model=='string') return console.log("\n### ERROR: Model data");
      this.addImages=data.addImages;
      this.delImages=data.delImages;
      this.model.images=data.images;
      this._refreshView();
    })
  }

  /** save data */
  save(){
    const list=this._verify();
    if(list.length) return this.disp.msgbox("Missing information<br>"+list.join("<br>"))
    // delete images
    this.delImages.forEach(image=>this.storage.delete(image));
    // add new images
    this.storage.uploadImages(this.addImages,_STORAGE_MODELS)
    .then(urls=>{
      const images=urls.map(url=>typeof url=='string'?{caption:'',url}:url)
      this.model.images=this.model.images.concat(images);
      return this.db.add(_DB_MODELS,this.model);
    })
    .then(()=>this.done('save'))
    .catch(err=>this.disp.msgbox("save data is error<br>"+err.message))
  }

  /** delete model */
  delete(){
    this.disp.msgbox("Are you sure delete model?",
    {buttons:[{text:'Cancel',role:'cancel'},{text:'Delete',role:'delete'}]})
    .then(result=>{
      if(result.role!=='delete') return;
      //delete images
      this.model.images.forEach(image=>this.storage.delete(image.url));
      //delete database
      this.db.delete(_DB_MODELS,this.model.id)
      .then(()=>this.done('delete'))
    })
  }


  /** detail tool */
  detail(tool:ToolData=null){
    //log
    console.log("INIT",{tool,model:this.model})
    const props:ToolPageOpts={
      model:this.model,
      tool
    }
    this.disp.showModal(ToolPage,props)
  }


  //////////////////// BACKGROUND ////////////////////
  /** verify data before saving */
  private _verify(){
    const list=['id','name','group','compQty','maintenance']
    return list.filter(key=>!this.model[key])
  }

}

//////
/**
 * @param model   model need to view/edit
 * @param tools all tools this model
 * @param isEdit  edit/view
 */
export interface ModelPageOpts{
  modelId?:string;
  model?:ModelData;   // model data or id, underfind=>create new
  tools?:ToolData[]         // default
  isEdit?:boolean;          // Enable edit
  isNew?:boolean;
}

/**
 * @param addImages images will add
 * @param delImages images will delete  
 * @param model Model information already update/revise 
 */
export interface ModelPageOuts{
  addImages:UrlData[];
  delImages:string[];
  model:ModelData;
}

export type ModelPageRole="back"|"delete"|"save"