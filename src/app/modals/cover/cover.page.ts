import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData, ChildData, createBasicData } from 'src/app/interfaces/basic.model';
import { CoverData, _DB_COVERS, _STORAGE_COVERS, createCoverData} from '../../interfaces/cover.interface';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/interfaces/tools.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service-2';
import { getList } from 'src/app/utils/minitools';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts, ImageViewPageRole } from '../image-view/image-view.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { ToolPage, ToolPageOpts } from '../tool/tool.page';
import { UtilService } from 'src/app/services/util/util.service';
import { SearchCompanyPage, SearchCompanyPageOpts, SearchCompanyPageOuts, SearchCompanyPageRole } from '../search-company/search-company.page';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { getUpdateImages, StorageService } from 'src/app/services/firebase/storage.service';
import { ConfigId, configs, ToolStatusConfig, _CONFIG_STATUS_ID, _DB_CONFIGS } from 'src/app/interfaces/config';
import { createSelfHistory, SelfHistory } from 'src/app/interfaces/save-infor.model';
import { UpdateInf } from 'src/app/utils/data.handle';
import { createStatusInfor, createToolStatus, StatusInf, StatusRecord, ToolStatus, _DB_STATUS_RECORD, createStatusRecord } from 'src/app/interfaces/status-record.model';
import { ToolStatusPage, ToolStatusPageOpts, ToolStatusPageOuts, ToolStatusPageRole } from '../tool-status/tool-status.page';
import { ToolService } from 'src/app/services/tool.service';
import { UrlData } from 'src/app/interfaces/urldata.interface';
import { BasicItem, createBasicItem } from 'src/app/interfaces/basic-item.interface';
import { MchModel, _DB_MCH_MODEL } from 'src/app/interfaces/mch-model';
import { MchModelPageInput } from '../mch-model/mch-model.page';
import { MchModelSearchPage, MchModelSearchPageInput, MchModelSearchPageOutput, MchModelSearchPageRole } from '../mch-model-search/mch-model-search.page';

const name_space="box"
const _BACKUP_LIST=["cover","addImages"]

@Component({
  selector: 'app-cover',
  templateUrl: './cover.page.html',
  styleUrls: ['./cover.page.scss'],
})
export class CoverPage implements OnInit {
  /** input data */
  cover:CoverData;
  coverId:string;
  isNew:boolean=false;

  /** internal variable */
  mchModels:MchModel[]=[];    // list of Machine Models
  children:BasicData[]=[];
  delImages:string[]=[];      //images will delete when save
  viewImages:UrlData[]=[];    // all images vill view
  groups:string[]=[];
  statusList:string[]=[];
  AllStatusList:string[]=[];
  histories:SelfHistory[]=[];
  lastRecord:StatusRecord=null;   //save last status of box
  addr:string=''
  /** internal control */
  isAvailble:boolean=false;
  isChange:boolean=false;
  backup:string[]=[];
  sChildren:ChildData[]=[]; //control select child to remove
  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService,
    public util:UtilService,
    private auth:AuthService,
    private storage:StorageService,
    private toolsv:ToolService
  ) { }
  
  /** intial */
  async ngOnInit() {
    await this._init();
    this.backup=this.isNew?[]:_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
    const groupId:ConfigId='groups';
    Promise.all([
      this.db.get(_DB_CONFIGS,groupId),
      this._getChildren(),
      this.db.get(_DB_CONFIGS,configs.toolstatus) as Promise<ToolStatusConfig>,
      this.db.search(_DB_STATUS_RECORD,{key:'ids',type:'array-contains',value:'cover-'+this.cover.id}) as Promise<StatusRecord[]>,
      this.toolsv.getAddr(this.cover),
    ]).then(([configs,children,statusConfig,records,addr])=>{
      console.log(" *** note *** addr:",addr)
      this.addr=addr.join(" / ");
      this.groups=configs['list']
      console.log("group",this.groups)
      if(!this.cover.statusList) this.cover.statusList=[];
      this.AllStatusList=statusConfig.statuslist.map(y=>y.key);
      this.statusList=this.AllStatusList.filter(x=>!this.cover.statusList.includes(x))
      //histories
      let lastRecord:StatusRecord;
      this.histories=records.map(r=>{
        const updateList:UpdateInf[]=r.data.find(x=>x.id===this.coverId && x.type=='cover').status.map(st=>{
          //last record
          if(!lastRecord) lastRecord=r
          else{
            const lastTime:number=new Date(lastRecord.createAt).getTime();
            const recTime:number=new Date(r.createAt).getTime();
            if(lastTime<recTime) lastRecord=r;
          }
          // update infor
          return {type:'update',oldVal:null,newVal:st.value,key:st.key}
        });
        return createSelfHistory({...r,updateList})
      })
      
      // last record
      if(lastRecord){
        const data:ToolStatus[]=lastRecord.data.filter(x=>x.id==this.cover.id)
        if(!data||!data.length) console.log("wrong data");
        else this.lastRecord=createStatusRecord({...lastRecord,data});//@@@
      }

      this.histories=this.histories.concat(this.cover.histories||[]);
      console.log("TEST-90",{histories:this.histories});
      this.histories.sort((a,b)=>{
        const at=new Date(a.createAt).getTime();
        const bt=new Date(b.createAt).getTime();
        return at-bt;
      })
      // histories=histories.concat()
      console.log("TEST, histories:",this.histories);
      this.refresh()
    })
  }

  /** view already */
  ionViewDidEnter(){
    const nodeList=document.querySelector("app-cover").querySelectorAll("ion-input,ion-textarea,ion-select")
    nodeList.forEach(node=>{
      node.addEventListener("ionChange",(event)=>{
        console.log(event);
        this.refresh();
      })
    })
  }


  ////////////// BUTTONS HANDLER ///////////////
  /** pickupMchModel */
  pickupMchModel(){

    const props:MchModelSearchPageInput={
      isMulti:false,
      selectedIds:this.cover.targetMchs.map(x=>x.id)
    }
    this.disp.showModal(MchModelSearchPage,props)
    .then(result=>{
      const role=result.role as MchModelSearchPageRole
      if(role!=='ok') return;
      const data=result.data as MchModelSearchPageOutput;
      this.cover.targetMchs=data.selects.map(mchModel=>createBasicItem({...mchModel,type:_DB_MCH_MODEL}))
    })
  }


  /** detail status */
  detailStatus(record:StatusRecord=null){
    let isEdit:boolean=false;
    const tool:BasicData=createBasicData({...this.cover,type:'cover'})
    if(!record){
      isEdit=true;
      // const userId:string=this.auth.currentUser.id;
      const status:StatusInf[]=createStatusInfor(this.cover.statusList);
      const data:ToolStatus[]=[createToolStatus({...tool,status,images:[]})]
      record=createStatusRecord({user:createBasicItem({...this.auth.currentUser,type:'user'}),data})
    }
    // display status
    const props:ToolStatusPageOpts={
      tool,
      status:record.data[0],
      isEdit
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const role=result.role as ToolStatusPageRole
      if(!isEdit || role!='save') return;
      const rData=result.data as ToolStatusPageOuts
      record.data=[rData.status]
      const {addImages,currImages}=getUpdateImages(rData.status.images);
      return this.storage.uploadImages(addImages,_STORAGE_COVERS)
      .then(urls=>{
        record.data[0].images=[...currImages,...urls];
        return this.db.add(_DB_STATUS_RECORD,record)
      })
      .then(record=>{
        this.lastRecord=record
      })
    })
    .catch(err=>{
      console.warn("\nERROR\n",err);
      this.disp.msgbox('ERROR<br>'+err.message)
    })
  }

  addProperty(pos:number,opr:'add'|'rem'='add'){
    if(opr=='add')
      this.cover.statusList.push(this.statusList[pos]);
    else 
      this.cover.statusList.splice(pos,1)

    this.refresh()
  }

  removeChild(){
    this.sChildren.forEach(child=>{
      //remove on cover
      let pos=this.cover.childrenId.findIndex(c=>c.id==child.id&&c.type==child.type)
      if(pos!=-1) this.cover.childrenId.splice(pos,1);
      //remove on display data
      pos=this.children.findIndex(c=>c.id==child.id&&c.type==child.type)
      if(pos!=-1) this.children.splice(pos,1);
      //
      this.refresh();
      this.sChildren=[];
    })
  }

  selectChild(child:ChildData){
    const pos=this.sChildren.findIndex(c=>c.id==child.id&&c.type==child.type)
    if(pos!=-1)  this.sChildren.splice(pos,1)
    else this.sChildren.push(child)
    console.log("selected",{selected:this.sChildren})
  }

  /** select company */
  selectCompany(){
    const props:SearchCompanyPageOpts={}
    this.disp.showModal(SearchCompanyPage,props)
    .then(result=>{
      const role=result.role as SearchCompanyPageRole
      const data=result.data as SearchCompanyPageOuts
      if(role!=='ok') return;
      this.cover.stay=data.companies[0];
      this.refresh();
    })
  }


  /** exit page */
  done(role:CoverPageRole='save'){
    const out:CoverPageOuts={
      cover:this.cover,
      delImages:this.delImages
    }
    this.modal.dismiss(out,role)
  }

  /** hander save button */
  save(){
    // delete image
    this.delImages.forEach(img=>this.storage.delete(img));
    // upload new images
    const newImages:UrlData[]=this.cover.images.filter(img=>!img.url.startsWith("https://"))
    this.storage.uploadImages(newImages,_STORAGE_COVERS)
    .then((urls:UrlData[])=>{
      this.cover.images=this.cover.images.concat(urls);
      return this.db.add(_DB_COVERS,this.cover,(list,newDb,oldDb)=>{
        if(!list.length) return null;
        const histories=oldDb['histories']||[]
        histories.push(createSelfHistory({updateList:list,userId:this.auth.currentUser.id}))
        return {...newDb,histories}
      })
    })
    .then(async ()=>{
      const coversId:string[]=this.cover.childrenId.filter(x=>x.type=='cover').map(x=>x.id)
      const covers:CoverData[]=await this.db.gets(_DB_COVERS,coversId);
      const ctr_covers=covers.map(cover=>{
        if(cover.upper.id==this.cover.id) return;//ignore cover already update
        cover.upper.id==this.cover.id
        return this.db.add(_DB_COVERS,cover).then(c=>c.id)
        
      })
      //
      const toolsId:string[]=this.cover.childrenId.filter(x=>x.type=='tool').map(x=>x.id)
      const tools:ToolData[]=await this.db.gets(_DB_TOOLS,toolsId);
      const ctr_tools=tools.map(tool=>{
        if(tool.upper.id==this.cover.id) return  ;//remove tool ready update
        tool.upper.id=this.cover.id
        return this.db.add(_DB_TOOLS,tool).then(x=>x.id)
      })
      return Promise.all([...ctr_covers,...ctr_tools])
    })
    .then(()=>this.done('save'))
    .catch(err=>{
      console.log("ERROR:",err);
      this.disp.msgbox(`Save ${name_space} data is failured!<br>`,err.message)
    })
  }

  /** handler delete button */
  delete(){
    this.disp.msgbox(`Are you sure delete this ${name_space}?`,
      {buttons:[{text:'Cancel',role:'cancel'},{text:'Delete',role:'delete'}]}
    ).then(result=>{
      if(result.role!='delete') return;
      //delete images
      const delImages=this.cover.images.reduce((acc,cur)=>{
        const imgs=[];
        if(cur.thumbnail) imgs.push(cur.thumbnail);
        if(cur.url) imgs.push(cur.url)
        return [...acc,...imgs]
      },[])
      const pImages=delImages.map(url=>this.storage.delete(url))
      //delete database
      const pDb=this.db.delete(_DB_COVERS,this.cover.id)
      //final
      Promise.all([...pImages,pDb])
      .then(()=>this.done('delete'))
      .catch(err=>console.warn("delete cover '%s'(%s) is error\n",this.cover.name,this.cover.id,err.message))
    })
  }

  /** add/edit images */
  detailImage(){
    const props:ImageViewPageOpts={
      images:this.cover.images,
      delImages:this.delImages
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      const role=result.role as ImageViewPageRole
      if(role!='ok') return;
      //handler
      const data=result.data as ImageViewPageOuts
      this.delImages=data.delImages
      this.cover.images=data.images
      this.refresh();
    })
  }

  /** print */
  print(e){
    // this.util.generaQRcode(this.cover.id,{label:this.cover.name,type:'cover',size:32})
    this.util.printCode(e,this.cover.id,{label:this.cover.name,type:'cover'})
  }

  /** add child */
  addChild(){
    const props:SearchToolPageOpts={
      type:'tool & cover',
      exceptionList:[
        ...this.cover.childrenId,
        {id:this.cover.id,type:'cover'},
        {id:this.cover.upper.id,type:'cover'}
      ]
    }
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole
      if(role!='ok') return;
      const data=result.data as SearchToolPageOuts
      this.children=[...this.children,...data.search]
      this.cover.childrenId=[...this.cover.childrenId,...data.search.map(x=>{return{id:x.id,type:x.type}})];
      this.refresh()
    })
  }

  /** pickup cover */
  pickupCover(){
    const props:SearchToolPageOpts={
      type:'cover',
      exceptionList:[{id:this.coverId,type:'cover'},...this.cover.childrenId]
    }
    this.disp.showModal(SearchToolPage,props).then(result=>{
      const role=result.role as SearchToolPageRole;
      if(role!='ok') return;
      const data=result.data as SearchToolPageOuts;
      this.cover.upper=createBasicItem({...data.search[0],type:'company'});
      this.refresh();
    })
  }

  /** detail child */
  detail(child:ChildData){
    if(child.type=='cover'){
      const props:CoverPageOpts={
        coverId:child.id
      }
      return this.disp.showModal(CoverPage,props)
    }
    if(child.type=='tool'){
      const props:ToolPageOpts={toolId:child.id}
      return this.disp.showModal(ToolPage,props)
    }
    //outof case
    return this.disp.msgbox(`Data is wrong type`)
  }


  ////////////// BACKGROUND FUNCTIONS ////////////////
  showMchModels():string{
    if(!this.cover.targetMchs.length) return "(All)"
    return this.cover.targetMchs.map(x=>x.name).join(",")
  }
  displayUpdate(upadeList:UpdateInf[]){
    return upadeList.map(ud=>`${ud.type} "<li>${ud.key}": "${ud.oldVal}" -> "${ud.newVal}"</li>`).join("")
  }
  /** refresh view */
  private refresh(debug:string=""){
    //refresh isChange
    if(debug) console.log("refresh/debug\n",debug)
    //update images
    this.viewImages=this.cover.images;
    this.isAvailble=true;
    const list=this.cover.statusList||[];    
    this.statusList=this.AllStatusList.filter(x=>!list.includes(x))
  }

  /** init for first times */
  async _init():Promise<any>{
    if(!this.cover && !this.coverId){
      this.cover=createCoverData({user:createBasicItem({...this.auth.currentUser,type:'user'})})
      this.isNew=true;
      this.coverId=this.cover.id;
      return
    }
    // case 2: already get cover
    if(this.cover) {
      this.isNew=false;
      this.coverId=this.cover.id;
      return;
    }
    // case 3: get cover from db
    return await this.db.get(_DB_COVERS,this.coverId)
  }

  /** update view for childrenId */
  private async _getChildren(){//pls run one times
    //update data
    const coversId:string[]=this.cover.childrenId.filter(x=>x.type=='cover').map(y=>y.id)
    const covers:CoverData[]=await this.db.gets(_DB_COVERS,coversId);

    const toolsId:string[]=this.cover.childrenId.filter(x=>x.type=='tool').map(y=>y.id);
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,toolsId);
    const models:ModelData[]=await this.db.gets(_DB_MODELS, getList(tools,"model"))

    //console.log("[_getchildren]: test1",{covers,tools,coversId,toolsId,models})
    this.children=this.cover.childrenId.map(child=>{
      //console.log("[_getchildren]: test2",{child})
      if(child.type=='cover'){
        const cover=covers.find(c=>c.id==child.id);
        if(!cover) return;
        const out:BasicData=createBasicData({...cover,...child});
        //console.log("[_getchildren]: test3")
        return out;
      }
      //tool
      if(child.type=='tool'){
        //console.log("[_getchildren]: test4")
        const tool:ToolData=tools.find(t=>t.id==child.id)
        if(!tool) return;
        const model:ModelData=models.find(m=>m.id==tool.model);
        if(!model) return;
        const out:BasicData=createBasicData({...model,...child})
        //console.log("[_getchildren]: test5",{out})
        return out;
      }
      //console.log("[_getchildren]: test6/out of case")
      return;
    }).filter(x=>x);
    //console.log("[_getchildren]: test7",{children:this.children})
  }

}


/**
 * @param cover coverdata want to review/edit
 */
export interface CoverPageOpts{
  coverId?:string;
  cover?:CoverData;
}

/**
 * @param cover data
 * @param addImages images will add to server
 * @param delImages images will delete
 */
export interface CoverPageOuts{
  cover:CoverData;
  delImages:string[];
}

export type CoverPageRole="back"|"save"|"delete"
