import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData, BasicView, ChildData } from 'src/app/models/basic.model';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { searchObj, separateObj } from 'src/app/utils/data.handle';


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
  search:(ChildData|BasicData)[]=[];
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
  carts:BasicData[]=[];
  /** internal control */
  private _isData={tool:false,model:false,cover:false}
  isAvailable:boolean=false;

  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
  ){}

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

  /** close page */
  done(role:SearchToolPageRole='save'){
    const out:SearchToolPageOuts={
      search:this.search
    }
    this.modal.dismiss(out,role)
  }

  /** pickup model/cover */
  pickup(child:ChildData){
    if(this.search.find(x=>x.id==child.id&&x.type==child.type)) return;
    this.search.push(child);
    this.update();
  }
  /** show modal */
  showCart(event){
    const menus:MenuData[]=this.carts.map(cart=>{
      const menu:MenuData={
        name:cart.id,
        note:cart.name,
        image:cart.images.length? typeof cart.images[0]=='string'?cart.images[0]:cart.images[0].url:''
      }
      return menu;
    })
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
    const covers:CoverData[]=getCovers(this.search.filter(x=>x.type=='cover').map(x=>x.id),this.covers,[]);
    /** toolsId already selected */
    let toolsId:string[]=this.search.filter(x=>x.type=='tool').map(x=>x.id);
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
        childrenId:[{id:cover.id,type:'cover'}]
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
        childrenId
      }
      _views.push(view);
    })
    /** search */
    _views=this.keyword.length?searchObj(this.keyword,_views):_views;
    /** buil views */
    this.views=separateObj(_views,"group",{dataName:'models'})
    //update cart
    this.carts=this.search.map(search=>{
      if(search.type=='tool'){
        const tool=this.tools.find(t=>t.id==search.id)
        if(!tool) {console.log("\n### ERROR[3]: not found tool '%s' on database",search.id);return}
        const model=this.models.find(m=>m.id==tool.model);
        if(!model){console.log("\n### ERROR[4]: not found model '%s' on DB",tool.model);return}
        const cart:BasicData={
          ...search,
          name:model.name,
          group:model.group,
          images:model.images
        }
        return cart
      }
      if(search.type=='cover'){
        const cover=this.covers.find(c=>c.id==search.id)
        if(!cover){console.log("\n### ERROR[5]: Not found cover '%s' on DB",search.id);return}
        const cart:BasicData={
          ...search,
          name:cover.id,
          group:cover.group,
          images:cover.images,
        }
        return cart
      }
      //no thing
      console.log("\n### ERROR[6]: out of case",{search})
      return;
    }).filter(x=>x)
    //finish update
    this.isAvailable=true;
    console.log("\nrefresh data",{covers,toolsId,keyword:this.keyword,_views,all:this})
  }
}


//// output/input interaface
export type SearchToolPageType="tool"|"cover"|"tool & cover"
export type SearchToolPageRole="save"|"cancel"

/** input for search tool page
 * @param type?  tool/cover/tool & cover
 * @param search?  data already search before
 */
export interface SearchToolPageOpts{
  /** default =tool & cover */
  type?:SearchToolPageType
  /** default [] */
  search?:ChildData[]|BasicData[];
}



/** result of search
 * @param search result of search
 */
export interface SearchToolPageOuts{
  search:ChildData[];
}

