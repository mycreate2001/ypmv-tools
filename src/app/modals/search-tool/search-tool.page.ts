import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData, BasicView, ChildData, createBasicData } from 'src/app/interfaces/basic.model';
import { CodeFormatConfig, CodeFormatList } from 'src/app/interfaces/codeformat';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/interfaces/cover.interface';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/interfaces/tools.model';
import { MenuData } from 'src/app/interfaces/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';


interface ViewData{
  models:BasicView[];
  group:string;
}

@Component({
  selector: 'app-search-tool',
  templateUrl: './search-tool.page.html',
  styleUrls: ['./search-tool.page.scss'],
})
export class SearchToolPage implements OnInit {
  /** input */
  exceptionList:(ChildData|BasicData)[]=[];
  type:SearchToolPageType='tool & cover'

  /** db */
  toolDb:ConnectData;
  modelDb:ConnectData;
  coverDb:ConnectData;

  /** internal */
  tools:ToolData[]=[];
  models:ModelData[]=[];
  covers:CoverData[]=[];
  views:ViewData[]=[];
  keyword:string=''
  search:BasicData[]=[];
  /** internal control */
  private _isData={tool:false,model:false,cover:false}
  isAvailable:boolean=false;

  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
  ){}
  
  ////////////////// SYSTEM FUNCTIONS /////////////////////
  /** internal */
  ngOnInit(): void {
    /** connect database */
    //tool & model
    if(this.type=='tool'||this.type=='tool & cover'){ 
      this.toolDb=this.db.connect(_DB_TOOLS);
      this.modelDb=this.db.connect(_DB_MODELS);
      //
      this.toolDb.onUpdate((tools:ToolData[])=>{
        this.tools=tools;
        this._isData.tool=true;
        this.update();
      })

      this.modelDb.onUpdate((models:ModelData[])=>{
        this.models=models;
        this._isData.model=true;
        this.update();
      })
    }
    //cover
    if(this.type=='cover'|| this.type=='tool & cover'){
      this.coverDb=this.db.connect(_DB_COVERS);
      this.coverDb.onUpdate((covers:CoverData[])=>{
        this.covers=covers;
        this._isData.cover=true;
        this.update();
      })
    }
  }

  ngOnDestroy(){
    //disconnect database
    this.toolDb && this.toolDb.disconnect();
    this.modelDb && this.modelDb.disconnect();
    this.coverDb && this.coverDb.disconnect();
    console.log("exit search tool\n");
  }

  //////////////// HANDLER BUTTON FUNCTIONS ///////////////
  /** close page */
  done(role:SearchToolPageRole='ok'){
    const out:SearchToolPageOuts={
      search:this.search
    }
    this.modal.dismiss(out,role)
  }

  /** pickup model/cover */
  pickup(child:ChildData,model:BasicView){
    // const x:BasicData={
    //   ...child,
    //   name:model.name,
    //   group:model.group,
    //   images:model.images
    // }
    const x:BasicData=createBasicData({...model,...child})
    this.search.push(x);
    //remove child from model
    const pos=model.childrenId.findIndex(x=>x.id==child.id && x.type==child.type)
    if(pos!=-1) {
      model.childrenId.splice(pos,1);
      //remove model from view
      if(!model.childrenId.length) {
        const view=this.views.find(v=>v.group==model.group)
        const mPos=view.models.findIndex(m=>m.id==model.id);
        view.models.splice(mPos,1);
        //remove view from list
        if(!view.models.length){
          const vPos=this.views.findIndex(v=>v.group==model.group)
          this.views.splice(vPos,1)
        }
      }
    }
  }

  /** scan to add */
  scan(){
    const title:string=this.type
    const props:QRcodePageOpts={
      type:'analysis',
      title
    }
    this.disp.showModal(QrcodePage,props).then(result=>{
      const role=result.role as QRcodePageRole
      if(role!='ok') return;
      const data=result.data as QRcodePageOuts
      let child:ChildData=null;
      if(this.type=='cover') child={id:data.analysis[CodeFormatConfig.cover.name],type:'cover'}
      else if(this.type=='tool') child={id:data.analysis[CodeFormatConfig.tool.name],type:'tool'}
      else {//cover & tool
        const tool_code=data.analysis[CodeFormatConfig.tool.name]
        const cover_code=data.analysis[CodeFormatConfig.cover.name]
        child=tool_code?{id:tool_code,type:'tool'}:{id:cover_code,type:'cover'}
      }
      if(!child.id) return this.disp.msgbox(`Your scaned code is wrong type<br>pls scan ${this.type.replace("&","")} code`)
      //Exception list ->reject
      if(this.exceptionList.find(x=>(typeof x=='string' && x==child.id)||(x.type==child.type && x.id==child.id)))
        return this.disp.msgbox(`ERR[01]: Select tool/box inside Excluding list<br>id:"${child.id}"`);
      //search list => reject
      if(this.search.find(x=>x.type==child.type&&x.id==child.id))
      return this.disp.msgbox(`ERR[02]: Selected tool/box already in selected list<br>id:"${child.id}"`);
      let model:any=null;
      if(child.type=='tool'){
        const tool:ToolData=this.tools.find(x=>x.id==child.id);
        if(!tool) return this.disp.msgbox(`ERR[03]: Tool not yet register<br>toolId:"${child.id}"`)
        model=this.models.find(x=>x.id==tool.model)
        if(!model) return this.disp.msgbox(`ERR[04]: tool infor was not yet register<br>modelId:"${child.id}"`)
      }
      else{
        model=this.covers.find(x=>x.id==child.id)
        if(!model) return this.disp.msgbox(`ERR[05]: Box not yet register<br>boxId:"${child.id}"`)
      }
      this.search.push(createBasicData({...model,...child}))
    })
  }

  /** show modal */
  showCart(event){
    const menus:MenuData[]=this.search.map(cart=>{
      const menu:MenuData={
        name:cart.id,
        note:cart.name,
        image:cart.images.length? (typeof cart.images[0]=='string'?cart.images[0]:cart.images[0].url):''
      }
      return menu;
    })
    console.log("menus:",menus)
    this.disp.showMenu(event,{menus})
  }

  /// run backgroup /////
  /** check data available */
  private _checkAvailable(){
    const cover=this.type=='tool'?true:this._isData.cover?true:false
    const tool=this.type=='cover'?true:(this._isData.tool&&this._isData.model)?true:false
    const result=cover && tool
    console.log("\ncheck status",{condition:this._isData,result})
    return result
  }

  /** update/refresh view */
  update(){
    if(!this._checkAvailable()) return
    /** covers already selected */
    const exceptionList:(ChildData|BasicData)[]=[...this.search,...this.exceptionList]
    const covers:CoverData[]=getCovers(exceptionList.filter(x=>x.type=='cover'),this.covers,[]);
    /** toolsId already selected */
    let toolsId:string[]=exceptionList.filter(x=>x.type=='tool').map(x=>x.id);
    toolsId=covers.reduce((acc,cur)=>[...acc,...cur.childrenId.filter(x=>x.type=='tool').map(x=>x.id)],toolsId);
    /** it'll make view  */
    let _views:BasicView[]=[];
    //covers
    this.covers.forEach(cover=>{
      if(!cover) return console.log("\n### ERROR[1]: cover data is empty")
      if(covers.find(c=>c.id==cover.id)) return;//already in list
      const view:BasicView={
        id:cover.id,
        name:cover.name,
        group:cover.group,
        images:cover.images,
        type:'cover',
        childrenId:[{id:cover.id,type:'cover'}],
        modelId:cover.id,
        statusList:[]
      }
      _views.push(view)
    })
    //tools
    this.models.forEach(model=>{
      if(!model) return console.log("\n### ERROR[2]: Model data is empty");
      const childrenId:ChildData[]=this.tools
        .filter(t=>t.model==model.id && !toolsId.includes(t.id))
        .map(x=>{return{id:x.id,type:'tool'}})
      if(!childrenId.length) return;//model is empty tool
      const view:BasicView={
        id:model.id,
        name:model.name,
        group:model.group,
        images:model.images,
        type:'tool',
        childrenId,
        modelId:model.id,
        statusList:[]
      }
      _views.push(view);
    })
    /** search */
    _views=this.keyword.length?searchObj(this.keyword,_views):_views;
    /** buil views */
    this.views=separateObj(_views,"group",{dataName:'models'})
       //finish update
    this.isAvailable=true;
    console.log("\nrefresh data",{covers,toolsId,keyword:this.keyword,_views,all:this})
  }
}


//// output/input interaface
export type SearchToolPageType="tool"|"cover"|"tool & cover"
export type SearchToolPageRole="ok"|"cancel"

/** input for search tool page
 * @param type?  tool/cover/tool & cover
 * @param exceptionList?  data already search before
 */
export interface SearchToolPageOpts{
  /** default =tool & cover */
  type?:SearchToolPageType
  /** default [] */
  exceptionList?:ChildData[]|BasicData[];
}



/** result of search
 * @param search result of search
 */
export interface SearchToolPageOuts{
  search:BasicData[];
}

