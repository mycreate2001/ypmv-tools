import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../../services/display/display.service';

import {  createModelData,  ModelData,  ToolData,  _DB_MODELS, _DB_TOOLS, _STORAGE_MODELS } from '../../interfaces/tools.model';
import { searchObj, searchObj2, separateObj } from 'src/app/utils/data.handle';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { CoverData, createCoverData, _DB_COVERS, _STORAGE_COVERS } from '../../interfaces/cover.interface';
import { BasicData, BasicView, ChildData } from 'src/app/interfaces/basic.model';
import { ModelPage, ModelPageOpts, ModelPageOuts, } from '../../modals/model/model.page';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { CoverPage, CoverPageOpts, CoverPageOuts } from 'src/app/modals/cover/cover.page';
import { UrlData } from 'src/app/interfaces/util.model';
import { _DB_USERS } from 'src/app/interfaces/user.model';
import { ToolPage, ToolPageOpts } from 'src/app/modals/tool/tool.page';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from 'src/app/modals/qrcode/qrcode.page';
import { CodeFormatConfig } from 'src/app/interfaces/codeformat';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {

  /** cloud database */
  models:ModelData[]=[];
  covers:CoverData[]=[];
  tools:ToolData[]=[];

  /** internal variable */
  views:viewData[]=[];
  key:string="";

  /** control */

  constructor(
    private disp:DisplayService,
    private route:ActivatedRoute
  ) {}

  /** system OnInit */
  ngOnInit() {
    // //model
    // this._modelDb=this.db.connect(_DB_MODELS);
    // this._modelDb.onUpdate((models:ModelData[])=>{
    //   this.models=models;
    //   this._isData.model=true;
    //   this.update();
    // })

    // //cover
    // this._coverDb=this.db.connect(_DB_COVERS);
    // this._coverDb.onUpdate((covers:CoverData[])=>{
    //   this.covers=covers;
    //   this._isData.cover=true;
    //   this.update();
    // })
    this.route.data.subscribe(data=>{
      this.models=data.models
      this.covers=data.covers
      this.tools=data.tools;
      this.update();
    })
  }

  /** system destroy */
  ngOnDestroy(){
  }

  /** update view */
  update(){
    //1. collect all data
    let _views:BasicView[]=[];
    //covers
    this.covers.forEach(cover=>{
      const view:BasicView={
        id:cover.id,
        name:cover.name,
        group:cover.group,
        images:cover.images,
        type:'cover',
        statusList:cover.statusList,
        childrenId:[{id:cover.id,type:'cover'}]
      }
      _views.push(view)
    })
    //model & tools
    this.models.forEach(model=>{
      const childrenId:ChildData[]=this.tools
        .filter(t=>t.model===model.id)
        .map(tool=>{
        return {
          id:tool.id,
          type:'tool'
        }
      })
      const view:BasicView={
        id:model.id,
        name:model.name,
        group:model.group,
        images:model.images,
        type:'tool',
        statusList:model.statusList,
        childrenId
      }
      _views.push(view)
    })

    /** 2 search data */
    // correct keyword
    const keyword=this.key.split(/[ ,.;\n\t]/g)
      .map(x=>x.trim()).filter(x=>!!x).join(" ");
    // filter
    _views=this.key?_views.filter((obj)=>{
      const result=searchObj2(keyword,obj)
      return result;
    }):_views
    //build
    this.views=separateObj(_views,"group",{dataName:'models'});
    this.views.forEach(view=>{
      if(!view.group) view.group="(other)"
    })
    console.log("\n---- update -----\n",this);
  }

  /** detail cover/model */
  detail(model:BasicData){
    if(model.type=='cover'){
      const cover=this.covers.find(c=>c.id==model.id)
      if(!cover) return this.disp.msgbox(`ERROR: cannot find box '${model.id}' on DB`)
      return this.detailCover(cover);
    }
    if (model.type=='tool'){
      const _model=this.models.find(m=>m.id==model.id);
      if(!_model) return this.disp.msgbox(`ERROR: not found model '${model.id}' on db`)
      return this.detailModel(_model);
    }
  
    this.disp.msgbox(`unknow type of <br>'${JSON.stringify(model)}'`)
  }

  detailTool(toolId:string){
    const props:ToolPageOpts={
      toolId,
      isEdit:true
    }
    this.disp.showModal(ToolPage,props)
  }


  /** show detial cover */
  detailCover(iCover:CoverData|string=null){
    console.log("[detailCover]",{iCover})
    let coverId:string="";
    let cover:CoverData=null;
    if(typeof iCover=='string')  coverId=iCover;
    else cover=iCover;

    const props:CoverPageOpts={
      cover,
      coverId
    }
    this.disp.showModal(CoverPage,props)
  }

  /** detail model */
  detailModel(iModel:ModelData|string=null){
    let model:ModelData=null;
    let modelId:string="";
    if(typeof iModel=='string') modelId=iModel;
    else model=iModel
    const props:ModelPageOpts={model,isEdit:true,modelId}
    this.disp.showModal(ModelPage,props)
  }

  // /** scan code */
  // scan(){
  //   const props:QRcodePageOpts={
  //     type:'analysis',
  //     title:'model,tool,box'
  //   }
  //   this.disp.showModal(QrcodePage,props)
  //   .then(result=>{
  //     const role=result.role as QRcodePageRole;
  //     if(role!=='ok') return;
  //     const data=result.data as QRcodePageOuts;
  //     const toolId=data.analysis[CodeFormatConfig.tool.name]
  //     if(toolId) return this.detailTool(toolId);
  //     const coverId=data.analysis[CodeFormatConfig.cover.name];
  //     if(coverId) return this.detailCover(coverId);
  //     const modelId=data.analysis[CodeFormatConfig.model.name];
  //     if(modelId) return this.detailModel(modelId);
  //     console.warn("ERROR:",{analysis:data.analysis});
  //     this.disp.msgbox(`code "${data.analysis.toString()}" is other case`)
  //   })
  // }

  //////////// backgroup ////////////////
  

}

/////// interface /////////////
export interface AddImageData{
  path:string;
  addImages:string[];
}


interface viewData {
  group:string;
  models:BasicData[];
}



