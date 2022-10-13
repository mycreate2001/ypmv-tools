import { Component, OnInit } from '@angular/core';
import { AlertOptions, ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ConfigId,  _DB_CONFIGS } from 'src/app/models/config';
import { DisplayService } from 'src/app/services/display/display.service';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { CoverData, _DB_COVERS } from 'src/app/models/cover.model';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';
import { Alert } from 'selenium-webdriver';
import { MenuData } from 'src/app/models/util.model';
import { BCIDs, BcIdType } from 'src/app/services/util/util.interface';
import { createSelfHistory } from 'src/app/models/save-infor.model';
const _CHANGE_LIST="ion-select,ion-input,ion-checkbox"
const _BACKUP_LIST=['tool']
@Component({
  selector: 'app-tool',
  templateUrl: './tool.page.html',
  styleUrls: ['./tool.page.scss'],
})
export class ToolPage implements OnInit {
  /** input */
  tool:ToolData;
  toolId:string;
  isEdit:boolean=true;//can edit
  /** model data default get from db */
  model:ModelData;

  /** internal variable */
  isChange:boolean=false;
  isNew:boolean=false;  //new code
  isAvailable:boolean=false;
  status:object={};
  statusList:string[]=[];
  backup:string[];
  items=[
    {name:'name',value:'name'},{name:'group',value:'Group'},
    {name:'maintenance',value:'maintenance'},{name:'Quantity',value:'compQty'},
    {name:'Meno',value:'note'}
  ]//'name','group','maintenance','compQty','note'
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

  /** init */
  ngOnInit() {
    this._getTool()
    .then(({isNew,tool})=>{
      this.tool=tool;
      this.isNew=isNew;
      this.isEdit=this.isNew?true:this.isEdit;
      
      const ctrModel= this._getModel();
      const idToolStatus:ConfigId='toolstatus'
      const ctrstatus=this.db.get(_DB_CONFIGS,idToolStatus);
      Promise.all([ctrModel,ctrstatus]).then(([model,_status])=>{
        this.model=model;
        const {id,...status}=_status;
        this.statusList=Object.keys(status)
        this.status=status;
        this.isAvailable=true;
        this.backup=this.isNew?[]:_BACKUP_LIST.map(key=>JSON.stringify(this[key]));
        this._refreshView();
      })
    })
    .catch(err=>console.log("\n### ERROR[2]: get data is error",err))
  }

  ionViewDidEnter(){
    const nodeList=document.querySelector('app-tool').querySelectorAll(_CHANGE_LIST);
    console.log("TEST,",{nodeList})
    nodeList.forEach(node=>{
      // node.addEventListener("change",(e)=>{
      //   this._refreshView("change");
      // })
      node.addEventListener("ionChange",(e)=>{
        this._refreshView("ionChange");
      })
    })
  }

  //////////////// HANDLE FUNCTIONS ///////////////////////////
  /** read code */
  readCode(){
    const props:QRcodePageOpts={
      type:'code',
      title:'scan code'
    }
    this.disp.showModal(QrcodePage,props)
    .then(result=>{
      const role=result.role as QRcodePageRole;
      if(role!='ok') return;
      const data=result.data as QRcodePageOuts
      const code=data.code;
      this.tool.id=code;
      this.toolId=code;
    })
  }
  /** pickup upper/parents ID */
  pickupParent(){
    const props:SearchToolPageOpts={
      type:'cover'
    }
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole;
      if(role!='ok') return;
      const data=result.data as SearchToolPageOuts;
      this.tool.upperId=data.search[0].id;
      this._refreshView("pickup Parents");
    })
  }

  /** save */
  async save(){
    // validate data

    try{
      // update children for cover
      if(this.tool.upperId){
        const cover:CoverData=await this.db.get(_DB_COVERS,this.tool.upperId)
        if(!cover) throw new Error("data is wrong");
        const tool=cover.childrenId.find(x=>x.type=='tool' && x.id==this.tool.id)
        if(!tool){
          cover.childrenId.push({id:this.tool.id,type:'tool'})
          await this.db.add(_DB_COVERS,cover,(updateList,newData,oldData)=>{
              if(!updateList.length) return null;
              const histories=oldData['histories']||[];
              histories.push(createSelfHistory({updateList,userId:this.auth.currentUser.id}))
              return {...newData,histories}
          })
        }
      }

      // save data
      this.db.add(_DB_TOOLS,this.tool,(updateList,newData,oldData)=>{
        if(!updateList.length) return null;
        const histories=oldData['histories']||[];
        histories.push(createSelfHistory({updateList,userId:this.auth.currentUser.id}))
        return {...newData,histories}
      })
      .then(()=>this.done('ok'))
    }
    catch(err){

    }
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
      //delete db
      this.db.delete(_DB_TOOLS,this.tool.id)
      .then(()=>this.done('delete'))
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
  print(e){
    this.util.printCode(e,this.tool.id,{label:this.model.name,type:'tool'})
    // const menus:MenuData[]=[
    //   {name:'2D QRcode',role:'qrcode-none'},
    //   {name:'2D QRcode + label',role:'qrcode-label'},
    //   {name:'2D Datamatrix',role:'datamatrix-none'},
    //   {name:'2D Datamatrix + label',role:'datamatrix-label'},
    //   {name:'1D Barcode',role:'code128-none'},
    // ]
    // this.disp.showMenu(e,{menus}).then(result=>{
    //   const role=result.role;
    //   if(role=='backdrop') return;
    //   const bcid=role.split("-")[0] as BcIdType
    //   const label=role.split("-")[1]=='label'?this.model.name:''
    //   if(!BCIDs.includes(bcid)) return;
    //   this.util.generateCode(this.tool.id,{label,type:'tool',bcid})
    // })
  }

  ////////////////// BACKGROUND FUNCTIONS /////////////////////
  private _refreshView(debug:string=""){
    //isChange
    this.isChange=_BACKUP_LIST.some((key,pos)=>this.backup[pos]!=JSON.stringify(this[key]))
    this.isAvailable=true;
    if(debug) console.log("refresh view\ndebug:%s\n",debug,this);
  }
  /** get Tool data */
  private _getTool():Promise<{tool:ToolData,isNew:boolean}>{
    return new Promise((resolve,reject)=>{
      const isNew=false;
      if(!this.tool && !this.toolId){
        if(!this.model||typeof this.model!=='object') return reject(new Error("tool infor is wrong"))
        const model:string=this.model.id;
        const userId:string=this.auth.currentUser.id;
        return resolve({isNew:true,tool:createToolData({userId,model})})}
      if(this.tool) return resolve({isNew,tool:this.tool})
      if(this.toolId) {
        this.db.get(_DB_TOOLS,this.toolId)
        .then((tool:ToolData)=>resolve({tool,isNew}))
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
   /** id of tool */
  toolId?:string;
  /** tool data */
  tool?:ToolData;
  /** tool model */
  model?:ModelData;
  isEdit?:boolean;    //default=true;
}

export interface ToolPageOuts{
  tool:ToolData
}

