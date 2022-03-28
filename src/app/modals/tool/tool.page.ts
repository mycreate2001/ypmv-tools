import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import QrCreator from 'qr-creator';
import { ButtonData } from 'src/app/models/util.model';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UtilService } from 'src/app/services/util/util.service';


@Component({
  selector: 'app-tool',
  templateUrl: './tool.page.html',
  styleUrls: ['./tool.page.scss'],
})
export class ToolPage implements OnInit {
  /** input */
  tool:ToolData;
  toolId:string;
  /** model data default get from db */
  model:ModelData;

  /** internal variable */
  isAvailable:boolean=false;
  buttons:ButtonData[]=btnDefault()
  visualStatus=['OK',"Not check",'Scratch','broken'];
  operationStatus=['OK',"Not check",'cannot operation'];
  functionStatus=['OK',"Not check","tolerance's out of specs"];
  compQtyStatus=["OK","Not check","NG"]
 
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private auth:AuthService,
    private util:UtilService
  ) {

  }

  ngOnInit() {
    this._getTool()
    .then(tool=>{
      this.tool=tool;
      return this._getModel()
    })
    .then(model=>{
      this.model=model;
      this.isAvailable=true;
      console.log("\ninitial",{model,all:this});
    })
    .catch(err=>console.log("\n### ERROR[2]: get data is error",err))
  }

  /** get Tool data */
  private _getTool():Promise<ToolData>{
    return new Promise((resolve,reject)=>{
      if(!this.tool && !this.toolId) return resolve(createToolData({createAt:this.auth.currentUser.id}))
      if(this.tool) return resolve(this.tool)
      if(!this.tool) {
        this.db.get(_DB_TOOLS,this.toolId)
        .then((tool:ToolData)=>resolve(tool))
        .catch(err=>reject(err))
      }
    })
  }

  /** get model data */
  private _getModel():Promise<ModelData>{
    return new Promise((resolve,reject)=>{
      if(!this.model || this.tool.model!=this.model.id){//need to update model
        this.db.get(_DB_MODELS,this.tool.model)
        .then((model:ModelData)=>resolve(model))
        .catch(err=>reject(err))
      }
      else resolve(this.model)
    })
  }

  /** exit page */
  done(role:string="OK"){
    const out:ToolPageOuts={
      tool:this.tool
    }
    return this.modal.dismiss(out,role);
  }

  /** print code */
  print(){
    this.util.generaQRcode(this.tool.id,{type:'tool',size:38});
  }

}

function btnDefault():ButtonData[]{
  return [
    {role:'delete',icon:'trash'},
    {role:'ok',icon:'save'}
  ]
}

/////////////// INTERFACE ///////////////////
/**
 * @param tool ? tool data
 * @param model?
 * @param toolId
 */
 export interface ToolPageOpts{
  /** tool data */
  tool?:ToolData;
  /** tool model */
  model?:ModelData;
  /** id of tool */
  toolId?:string;
}

export interface ToolPageOuts{
  tool:ToolData
}

