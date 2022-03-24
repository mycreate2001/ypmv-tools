import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../../services/display/display.service';

import {  createModelData,  ModelData,  _DB_MODELS, _DB_TOOLS, _STORAGE_MODELS } from '../../models/tools.model';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { CoverData, createCoverData, _DB_COVERS, _STORAGE_COVERS } from '../../models/cover.model';
import { BasicData } from 'src/app/models/basic.model';
import { ModelPage, ModelPageOpts, ModelPageOuts, } from '../../modals/model/model.page';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { CoverPage, CoverPageOpts, CoverPageOuts } from 'src/app/modals/cover/cover.page';


@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {

  /** cloud database */
  models:ModelData[]=[];
  covers:CoverData[]=[];
  private _modelDb:ConnectData;
  private _coverDb:ConnectData;

  /** internal variable */
  views:viewData[]=[];
  key:string="";

  /** control */
  private _isData={model:false,cover:false}
  isAvailable:boolean=false;


  constructor(
    private disp:DisplayService,
    private db:FirestoreService,
    private storage:StorageService,
    private auth:AuthService
  ) {
  }

  /** system OnInit */
  ngOnInit() {
    //model
    this._modelDb=this.db.connect(_DB_MODELS);
    this._modelDb.onUpdate((models:ModelData[])=>{
      this.models=models;
      this._isData.model=true;
      this.update();
    })

    //cover
    this._coverDb=this.db.connect(_DB_COVERS);
    this._coverDb.onUpdate((covers:CoverData[])=>{
      this.covers=covers;
      this._isData.cover=true;
      this.update();
    })
  }

  /** system destroy */
  ngOnDestroy(){
    this._modelDb.disconnect();
    this._coverDb.disconnect();
  }

  /** update view */
  update(){
    let _views:BasicData[]=[];
    //covers
    this.covers.forEach(cover=>{
      if(!cover) return console.log("\nERROR[1]: Cover is empty");
      const view:BasicData={
        id:cover.id,
        name:cover.name,
        group:cover.group,
        images:cover.images,
        type:'cover'
      }
      _views.push(view)
    })
    //model & tools
    this.models.forEach(model=>{
      if(!model) return console.log("\n### ERROR[2]: Model is empty");
      const view:BasicData={
        id:model.id,
        name:model.name,
        group:model.group,
        images:model.images,
        type:'tool'
      }
      _views.push(view)
    })

    //search data
    _views=this.key?searchObj(this.key,_views):_views
    //build
    this.views=separateObj(_views,"group",{dataName:'models'})
    this.isAvailable=true;
    console.log("\n---- update -----\n",this);
  }

  /** add model */
  addModel(){
    const model=createModelData({userId:this.auth.currentUser.id})
    this.detailModel(model);
  }

  /** add cover */
  addCover(){
    const cover=createCoverData({userId:this.auth.currentUser.id});
    this.detailCover(cover);
  }

  /** detail cover/model */
  detail(model:BasicData){
    if(model.type=='cover'){
      const cover=this.covers.find(c=>c.id==model.id)
      if(!cover) return console.log("\n### ERROR: cannot find cover '%i' on DB",model.id)
      this.detailCover(cover);
    }
    else if (model.type=='tool'){
      const _model=this.models.find(m=>m.id==model.id);
      if(!_model) return console.log("\n### ERROR: not found model '%s' on db",model.id)
      this.detailModel(_model);
    }
    else {console.log("\n#### ERROR: out of case/data wrong",model)}
  }


  /** show detial cover */
  detailCover(cover:CoverData){
    const props:CoverPageOpts={cover}
    this.disp.showModal(CoverPage,props)
    .then(result=>{
      const data=result.data as CoverPageOuts
      const role=result.role.toUpperCase();
      if(role=='OK'||role=='SAVE') 
        return  this.handlerSave(data.cover,_DB_COVERS,data.addImages,_STORAGE_COVERS,data.delImages);
      if(role=='DELETE') return this.handlerDelete(data.cover,_DB_COVERS)
    })
  }

  /** detail model */
  detailModel(model:ModelData){
    const props:ModelPageOpts={model}
    this.disp.showModal(ModelPage,props)
    .then(result=>{
      const data=result.data as ModelPageOuts
      const role=result.role.toUpperCase();
      if(role=='OK'|| role=='SAVE') 
        return this.handlerSave(data.model,_DB_MODELS,data.addImages,_STORAGE_MODELS,data.delImages)
      if(role=='DELETE') return this.handlerDelete(data.model,_DB_MODELS)
    })
  }

  //////////// backgroup ////////////////
  
  /** handler save/revise data */
  handlerSave(data,tbl:string,addImages:string[]=[],path:string='',delImages:string[]=[]){
    delImages.forEach(image=>this.storage.delete(image))
    this.storage.uploadImages(addImages,path)
    .then((urls:string[])=>{
      if(!urls.length) return data;
      if(!data['images']) data['images']=urls;
      else data['images']=data['images'].concat(urls);
      return data;
    })
    .then(data=>this.db.add(tbl,data))
    .then(()=>console.log("save data to '%s' successfull",tbl))
    .catch(err=>console.log("### ERROR: save data to '%s' failred!\n",tbl,err))
  }

  /** handler delete data */
  handlerDelete(data:any,tbl:string){
    const PRG="[delete]"
    const id=data.id;
    const images:string[]=data.images;
    if(!id ) return console.log("%s ### ERROR[1]: delete data from '%s' failured, cause of formatt\n",PRG,tbl,data);
    if(images && images.length){
      const a=images.map(image=>this.storage.delete(image));
      const b=this.db.delete(tbl,id)
      Promise.all([...a,b]).then(()=>console.log("delete data '%s' from '%s' successfull",id,tbl))
      .catch(err=>console.log("\n### ERROR: delete '%s' from '%s' is failured\n",id,tbl,err))
    }
    else{
      this.db.delete(tbl,id)
      .then(()=>console.log("delete data '%s' from '%s' successfull",id,tbl))
      .catch(err=>console.log("\n### ERROR: delete '%s' from '%s' is failured\n",id,tbl,err))
    }
    
  }

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



