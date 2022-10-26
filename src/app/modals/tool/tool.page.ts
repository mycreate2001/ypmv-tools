import { Component, OnInit } from '@angular/core';
import { AlertOptions, ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ConfigId,  configs,  StatusConfig,  ToolStatusConfig,  _DB_CONFIGS } from 'src/app/models/config';
import { DisplayService } from 'src/app/services/display/display.service';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { CoverData, _DB_COVERS } from 'src/app/models/cover.model';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';
import { Alert } from 'selenium-webdriver';
import { MenuData } from 'src/app/models/util.model';
import { BCIDs, BcIdType } from 'src/app/services/util/util.interface';
import { createSelfHistory, SelfHistory } from 'src/app/models/save-infor.model';
import { createStatusInfor, createStatusRecord, createToolStatus, StatusInf, StatusRecord, ToolStatus, _DB_STATUS_RECORD, _STATUS_NG, _STATUS_NOTYET, _STATUS_OK, _STORAGE_STATUS_RECORD } from 'src/app/models/status-record.model';
import { UpdateInf } from 'src/app/utils/data.handle';
import { getList } from 'src/app/utils/minitools';
import { ToolStatusPage, ToolStatusPageOpts, ToolStatusPageOuts, ToolStatusPageRole } from '../tool-status/tool-status.page';
import { BasicData, createBasicData } from 'src/app/models/basic.model';
import { getUpdateImages, StorageService } from 'src/app/services/firebase/storage.service';
import { FirebaseStorage } from 'firebase/storage';
const _CHANGE_LIST="select,input,checkbox"
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
  histories:SelfHistory[]=[];
  isChange:boolean=false;
  isNew:boolean=false;  //new code
  isAvailable:boolean=false;
  statusConfigs:StatusConfig[];
  // lastStatus:ToolStatus=null;
  lastRecord:StatusRecord=null;
  backup:string[];
  items=[
    {name:'name',value:'name'},{name:'group',value:'Group'},
    {name:'maintenance',value:'maintenance'},{name:'Quantity',value:'compQty'},
    {name:'Memo',value:'note'}
  ]//'name','group','maintenance','compQty','note'
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private auth:AuthService,
    private util:UtilService,
    private disp:DisplayService,
    private storage:StorageService
  ) {

  }

  ///////////////// SYSTEM FUNCTIONS //////////////////////

  /** init */
  ngOnInit() {
    //1. get tool
    this._getTool()
    .then(({isNew,tool})=>{
      this.tool=tool;
      this.isNew=isNew;
      this.toolId=this.tool.id;
      this.isEdit=this.isNew?true:this.isEdit;
      //2. update more infor
      Promise.all([
        this.db.get(_DB_CONFIGS,configs.toolstatus) as Promise<ToolStatusConfig>,
        this.db.get(_DB_MODELS,this.tool.model) as Promise<ModelData>,
        this.db.search(_STORAGE_STATUS_RECORD,{key:'ids',type:'array-contains',value:'tool-'+this.toolId}) as Promise<StatusRecord[]>
      ])
      .then(([config,model,records])=>{
        this.statusConfigs=config.statuslist.map(cf=>{
          const list:string[]=[_STATUS_OK.key,_STATUS_NOTYET.key,...cf.list]
          return {...cf,list}
        })
        this.isAvailable=true;
        this.backup=this.isNew?[]:_BACKUP_LIST.map(key=>JSON.stringify(this[key]));
        if(!this.model || this.model.id!==model.id) this.model=model;
        let lastRecord:StatusRecord=null;
        this.histories=records.map(record=>{
          const updateList:UpdateInf[]=record.data.find(x=>x.id==this.toolId).status.map(stt=>{
            return {key:stt.key,type:'add',newVal:stt.value,oldVal:null}
          })
          //last record
          if(!lastRecord) lastRecord=record;
          else{
            const rtime=new Date(record.createAt).getTime();
            const ltime=new Date(lastRecord.createAt).getTime();
            if(rtime>ltime) lastRecord=record;
          }
          //result
          return createSelfHistory({...record,updateList})
        })

        //lastRecord
        if(lastRecord){
          const data=lastRecord.data.filter(tool=>tool.id==this.tool.id);
          if(!data||!data.length) console.warn("ERROR");
          else this.lastRecord={...lastRecord,data}
        }
        console.log("TEST:check record",{lastRecord})

        // 4. refresh
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
  }

  /** update status */
  updateStatus(record:StatusRecord=null){
    let isEdit:boolean=false
    const tool:BasicData=createBasicData({...this.model,...this.tool,type:'tool'})
    if(!record){
      isEdit=true;
      const userId=this.auth.currentUser.id;
      const status:StatusInf[]=createStatusInfor(this.model.statusList)
      const data:ToolStatus[]=[createToolStatus({...tool,status,images:[]})]
      record=createStatusRecord({userId,data});
    }
    //display
    const props:ToolStatusPageOpts={
      tool,
      status:record.data[0],
      isEdit
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const role=result.role as ToolStatusPageRole
      if(!isEdit||role!='save') return;
      const data=result.data as ToolStatusPageOuts
      record.data=[data.status];
      const {addImages,currImages}=getUpdateImages(data.status.images)
      return this.storage.uploadImages(addImages,_STORAGE_STATUS_RECORD).then(urls=>{
        record.data[0].images=[...currImages,...urls]
        return this.db.add(_DB_STATUS_RECORD,record) as Promise<StatusRecord>
      })
    })
    .then(record=>{
      this.lastRecord=record;
    })
    .catch(err=>{
      console.warn("\nERROR\n",err);
      this.disp.msgbox('ERROR<br>'+err.message)
    })
  }

  detailStatus(){
    if(!this.lastRecord) return;
    const props:ToolStatusPageOpts={
      tool:createBasicData({...this.model,...this.tool,type:'tool'}),
      status:this.lastRecord.data[0],
      isEdit:false
    }
    this.disp.showModal(ToolStatusPage,props)
  }

  ////////////////// BACKGROUND FUNCTIONS /////////////////////
  // getStatus():string{
  //   if(!this.lastStatus) return _STATUS_NOTYET.key
  //   if(this.lastStatus.some(stt=>stt.value==_STATUS_NOTYET.value)) return _STATUS_NOTYET.key
  //   return this.lastStatus.every(stt=>stt.value==_STATUS_OK.value)?_STATUS_OK.key:_STATUS_NG.key
  // }
  getStatusList(key:string):StatusConfig{
    return this.statusConfigs.find(x=>x.key==key)
  }

  private _refreshView(debug:string=""){
    //isChange
    this.isChange=_BACKUP_LIST.some((key,pos)=>this.backup[pos]!=JSON.stringify(this[key]))
    this.isAvailable=true;
    if(debug) console.log("refresh view\ndebug:%s\n",debug,this);
  }
  /** get Tool data */
  private async _getTool():Promise<{tool:ToolData,isNew:boolean}>{
    if(!this.tool && !this.toolId){
      const tool=createToolData({userId:this.auth.currentUser.id,companyId:this.auth.currentUser.companyId,model:this.model.id})
      return {isNew:true,tool}
    }
    if(this.tool) return {isNew:false,tool:this.tool}
    return this.db.get(_DB_TOOLS,this.toolId)
    .then((tool:ToolData)=>{return {tool,isNew:false}})
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

