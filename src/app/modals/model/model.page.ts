import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { UserData } from 'src/app/models/user.model';
import { ButtonData } from 'src/app/models/util.model';
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
  model:ModelData|string;   //model data or modelId
  isEdit:boolean=false;

  /** internal */
  isAvailble:boolean=false;
  buttons:ButtonData[]=btnDefault()
  
  /** use internal only, it's for view */
  viewImages:string[]=[];       //iamges wil add more to db
  addImages:string[]=[];
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
      this.model=model;
      return this.db.search(_DB_TOOLS,{key:'model',compare:'==',value:model.id})
    })
    .then((tools:ToolData[])=>{
      this.tools=tools;
      this._update();
    })

  }

  /** check & get model data */
  private async _getModel():Promise<ModelData>{
    return new Promise((resolve,reject)=>{
      if(typeof this.model!='string') return resolve(this.model)
      //id
      this.db.get(_DB_MODELS,this.model)
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

  //////// buttons //////////////
  detailImage(){
    if(typeof this.model=='string') return;
    this.model.images as string[]
    const props:ImageViewPageOpts={
      images:this.model.images,
      delImages:this.delImages,
      addImages:this.addImages,

    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      if(result.role.toUpperCase()!='OK') return;
      const data=result.data as ImageViewPageOuts;
      if(typeof this.model=='string') return console.log("\n### ERROR: Model data");
      this.addImages=data.addImages as string[];
      this.delImages=data.delImages;
      this.model.images=data.images as string[];
      this._update();
    })
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
        }
        break;

        default:
          console.log("#ERROR: Out of case, role:",result.role)
      }
    })
    
  }


 

}

//////
/**
 * @param model   model need to view/edit
 * @param tools all tools this model
 * @param isEdit  edit/view
 */
export interface ModelPageOpts{
  model:ModelData|string;   // model data or id, underfind=>create new
  tools?:ToolData[]         // default
  isEdit?:boolean;          // Enable edit
}

/**
 * @param addImages images will add
 * @param delImages images will delete  
 * @param model Model information already update/revise 
 */
export interface ModelPageOuts{
  addImages:string[];
  delImages:string[];
  model:ModelData;
}

function btnDefault():ButtonData[]{
  return [
    {role:'save',icon:'save'},
    {role:'delete',icon:'trash'}
  ]
}
