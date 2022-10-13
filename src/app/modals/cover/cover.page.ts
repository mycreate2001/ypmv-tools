import { Component, OnInit } from '@angular/core';
import { Config, ModalController } from '@ionic/angular';
import { BasicData, ChildData, createBasicData } from 'src/app/models/basic.model';
import { CoverData, createCoverData, _DB_COVERS, _STORAGE_COVERS} from '../../models/cover.model';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { getList } from 'src/app/utils/minitools';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts, ImageViewPageRole } from '../image-view/image-view.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { ToolPage, ToolPageOpts } from '../tool/tool.page';
import { UtilService } from 'src/app/services/util/util.service';
import { SearchCompanyPage, SearchCompanyPageOpts, SearchCompanyPageOuts, SearchCompanyPageRole } from '../search-company/search-company.page';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { UrlData } from 'src/app/models/util.model';
import { ConfigId, configList, configs, _DB_CONFIGS } from 'src/app/models/config';
import { createSelfHistory } from 'src/app/models/save-infor.model';
import { UpdateInf } from 'src/app/utils/data.handle';

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
  children:BasicData[]=[];
  addImages:UrlData[]=[];
  delImages:string[]=[];
  viewImages:UrlData[]=[];
  groups:string[]=[];
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
    private storage:StorageService
  ) { }
  
  /** intial */
  ngOnInit() {
    this._init().then(({cover,isNew})=>{
      this.cover=cover;
      this.coverId=cover.id;
      this.isNew=isNew;
      this.backup=this.isNew?[]:_BACKUP_LIST.map(key=>JSON.stringify(this[key]))
      const groupId:ConfigId='groups';
      // const groupCtr=this.db.get(_DB_CONFIGS,groupId);
      Promise.all([
        this.db.get(_DB_CONFIGS,groupId),
        this._getChildren()
      ]).then(results=>{
        this.groups=results[0]['list']
        console.log("group",this.groups)
        this.refresh()
      })
      

      // this._getChildren().then(()=>{
      //   this.refresh();
      // })
    });
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
      this.cover.stay=data.companyIds[0];
      this.refresh();
    })
  }


  /** exit page */
  done(role:CoverPageRole='save'){
    const out:CoverPageOuts={
      cover:this.cover,
      addImages:this.addImages,
      delImages:this.delImages
    }
    this.modal.dismiss(out,role)
  }

  /** hander save button */
  save(){
    // delete image
    this.delImages.forEach(this.storage.delete);
    // upload new images
    this.storage.uploadImages(this.addImages,_STORAGE_COVERS)
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
        if(cover.upperId!=this.cover.id){
          cover.upperId==this.cover.id
          return this.db.add(_DB_COVERS,cover).then(c=>c.id)
        }
        
      })
      //
      const toolsId:string[]=this.cover.childrenId.filter(x=>x.type=='tool').map(x=>x.id)
      const tools:ToolData[]=await this.db.gets(_DB_TOOLS,toolsId);
      const ctr_tools=tools.map(tool=>{
        tool.upperId=this.cover.id
        return this.db.add(_DB_TOOLS,tool).then(x=>x.id)
      })
      return Promise.all([...ctr_covers,...ctr_tools])
    })
    .then(()=>this.done('save'))
    .catch(err=>this.disp.msgbox(`Save ${name_space} data is failured!<br>`,err.message))
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
      addImages:this.addImages,
      delImages:this.delImages
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      const role=result.role as ImageViewPageRole
      if(role!='ok') return;
      //handler
      const data=result.data as ImageViewPageOuts
      this.addImages=data.addImages
      this.delImages=data.delImages
      this.cover.images=data.images
      this.viewImages=this.cover.images.concat(this.addImages);
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
        {id:this.cover.upperId,type:'cover'}
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
      this.cover.upperId=data.search[0].id;
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
  displayUpdate(upadeList:UpdateInf[]){
    return upadeList.map(ud=>`${ud.type} "<li>${ud.key}": "${ud.oldVal}" -> "${ud.newVal}"</li>`).join("")
  }
  /** refresh view */
  private refresh(debug:string=""){
    //refresh isChange
    if(debug) console.log("refresh/debug\n",debug)
    this.isChange=_BACKUP_LIST.every((key,pos)=>JSON.stringify(this[key])==this.backup[pos])?false:true
    //update images
    this.viewImages=this.cover.images.concat(this.addImages);
    this.isAvailble=true;
    console.log("\n---------Refresh data -------\n",this);
  }

  /** init for first times */
  private _init():Promise<{cover:CoverData,isNew:boolean}>{
    return new Promise((resolve,reject)=>{
      // case 1: new case
      let isNew:boolean=false;
      if(!this.cover && !this.coverId){
        const userId=this.auth.currentUser.id;
        const cover=createCoverData({userId})
        isNew=true;
        return resolve({cover,isNew})
      }
      // case 2: already get cover
      if(this.cover) return resolve({cover:this.cover,isNew})
      // case 3: get cover from db
      this.db.get(_DB_COVERS,this.coverId)
      .then(cover=>resolve({cover,isNew}))
      .catch(err=>reject(err))
    })
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
  addImages:UrlData[];
  delImages:string[];
}

export type CoverPageRole="back"|"save"|"delete"
