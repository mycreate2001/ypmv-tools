import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { ButtonData, MenuData } from 'src/app/models/util.model';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ConfigId,  _DB_CONFIGS } from 'src/app/models/config';
import { DisplayService } from 'src/app/services/display/display.service';


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
  isEdit:boolean=false;//can edit
  isNew:boolean=false;  //new code
  isAvailable:boolean=false;
  visualStatus=['OK',"Not check",'Scratch','broken'];
  operationStatus=['OK',"Not check",'cannot operation'];
  functionStatus=['OK',"Not check","tolerance's out of specs"];
  compQtyStatus=["OK","Not check","NG"]
  status:object={};
  statusList:string[]=[];
 
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private auth:AuthService,
    private util:UtilService,
    private disp:DisplayService
  ) {

  }

  ///////////////// SYSTEM FUNCTIONS //////////////////////
  ngOnInit() {
    this._getTool()
    .then(tool=>{
      this.tool=tool;
      return this._getModel()
    })
    .then(model=>{
      this.model=model;
      const id:ConfigId='toolstatus'
      return this.db.get(_DB_CONFIGS,id)
    })
    .then(config=>{
      const {id,...status}=config;
      this.status=status;
      this.statusList=Object.keys(status)
      this.isAvailable=true;
      console.log("\ninitial",this);
    })
    .catch(err=>console.log("\n### ERROR[2]: get data is error",err))
  }

  //////////////// HANDLE FUNCTIONS ///////////////////////////

  /** save */
  save(){
    // validate data
    this.db.add(_DB_TOOLS,this.tool)
    .then(()=>this.done('ok'))
  }

  /** delete */
  delete(){
    // confirm infor
    this.disp.msgbox(
      "Are you sure want to delete this tool ?",
      {
        buttons:[
          {text:'Cancel',role:'cancel',},
          {text:'Delete',role:'delete'}
        ]
      }
    ).then(result=>{
      if(result.role!=='delete') return;
      this.done('delete');
    })
  }

  /** exit page */
  done(role:ToolPageRole="ok"){
    const out:ToolPageOuts={
      tool:this.tool
    }
    return this.modal.dismiss(out,role);
  }

  /** print code */
  print(){
    this.disp.msgbox(
      "Which do you want to print<br>",
      { buttons:[ {text:'Code Only',role:'code'},{text:'With Label',role:'label'}]}
    ).then(result=>{
      this.util.generaQRcode(this.tool.id,{label:result.role=='label'?this.model.name:''})
    })
  }

  ////////////////// BACKGROUND FUNCTIONS /////////////////////

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

}

/////////////// INTERFACE ///////////////////
export type ToolPageRole="cancel"|"ok"|"delete"|"back"
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

