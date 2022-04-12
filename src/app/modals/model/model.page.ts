import { Component, OnInit } from '@angular/core';
import { AlertInput, ModalController } from '@ionic/angular';
import { ConfigId, configs, _DB_CONFIGS } from 'src/app/models/config';
import { createModelData, createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { UserData } from 'src/app/models/user.model';
import { ButtonData, MenuData, UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

import {  FirestoreService } from 'src/app/services/firebase/firestore.service';

import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts } from '../image-view/image-view.page';
import { ToolPage, ToolPageOpts, ToolPageOuts } from '../tool/tool.page';


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
  buttons:ButtonData[]=btnDefault()
  
  /** use internal only, it's for view */
  viewImages:UrlData[]=[];       //iamges wil add more to db
  addImages:UrlData[]=[];
  delImages:string[]=[];    //image will delete
  user:UserData;

  /** it's may get from database */
  visualStatus=["OK","scratch","Crack","other"];
  operationStatus=["OK","Not smomthly","Cannot operation","other"];
  functionStatus=["OK","Not correctly","other"];
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService
  ) {

  }

  ngOnInit() { 
    this._getModel()
    .then(model=>{
      this.model=model;this.modelId=this.model.id
      return this.db.search(_DB_TOOLS,{key:'model',type:'==',value:model.id})
    })
    .then((tools:ToolData[])=>{
      this.tools=tools;
      const id:ConfigId='groups'
      return this.db.get(_DB_CONFIGS,id)
      .then(result=>{
        this.groups=result.list ||[];//
        this._update();
      })
      
    })

  }

  /** check & get model data */
  private async _getModel():Promise<ModelData>{
    return new Promise((resolve,reject)=>{
      if(!this.model && !this.modelId){//new model
        this.tools=[];
        return resolve(createModelData({userId:this.auth.currentUser.id}))
      }
      if(this.model) return resolve(this.model)
      return this.db.get(_DB_MODELS,this.modelId)
      .then((model:ModelData)=>resolve(model))
      .catch(err=>reject(err))
    })
  }

  private _update(){
    if(typeof this.model=='string') return;
    this.viewImages=this.model.images.concat(this.addImages)
    this.isAvailble=true;
  }

  ///////// exist ////////
  done(role:string="OK"){
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
      this._update();
    })
  }

  save(){
    const list=this._verify();
    if(list.length) return this.disp.msgbox("Missing information<br>"+list.join("<br>"))
    this.done()
  }


  /** detail tool */
  detail(tool:ToolData=null){
    if(typeof this.model=='string') return;
    console.log("tool:",tool);
    tool=tool?tool:createToolData({userId:this.auth.currentUser.id,model:this.model.id})
    const props:ToolPageOpts={tool,model:this.model}
    this.disp.showModal(ToolPage,props)
    .then(result=>{
      const data=result.data as ToolPageOuts
      const xTool=data.tool;
      xTool.lastUpdate=new Date().toISOString();
      switch(result.role.toUpperCase()){
        case 'OK':
        case 'SAVE':{
          this.db.add(_DB_TOOLS,xTool)
        }
        break;

        case 'DELETE':{
          this.db.delete(_DB_TOOLS,xTool.id);
          const pos=this.tools.findIndex(x=>x.id==xTool.id)
          if(pos!=-1) this.tools.splice(pos,1);
        }
        break;

        default:
          console.log("#ERROR: Out of case, role:",result.role)
      }
    })
    
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

function btnDefault():ButtonData[]{
  return [
    {role:'save',icon:'save'},
    {role:'delete',icon:'trash'}
  ]
}
