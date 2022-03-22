import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../../services/display/display.service';

import {  createModelData, ModelData, ToolData, _DB_MODELS, _DB_TOOLS, _STORAGE_MODELS } from '../../models/tools.model';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { ButtonData } from 'src/app/models/util.model';
import { CoverData, _DB_COVERS } from 'src/app/models/cover.model';
import { BasicData } from 'src/app/models/basic.model';
import { ModelPage, ModelPageOpts, ModelPageOuts } from '../../modals/model/model.page';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
interface ModelExt extends BasicData{
  model:ModelData;
  cover:CoverData;
}
interface viewData {
  group:string;
  models:ModelExt
}

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
  newGroup:string="";

  /** internal variable */
  views:viewData[]=[];
  key:string="";
  /** internal control */
  buttons:ButtonData[]=btnDefault();

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
      this.update();
    })

    //cover
    this._coverDb=this.db.connect(_DB_COVERS);
    this._coverDb.onUpdate((covers:CoverData[])=>{
      this.covers=covers;
      this.update;
    })
  }

  /** system destroy */
  ngOnDestroy(){
    this._modelDb.disconnect();
    this._coverDb.disconnect();
  }

  /** update data */
  handlerButton(role:string){
    role=role.toUpperCase();
    if(role=='NEW TOOL'){
      this.detail();
    }

    if(role=='NEW COVER'){
      console.log("new cover")
      return;
    }
  }

  /** update view */
  update(){
    let models:ModelExt[]=[];
    //model
    this.models.forEach(model=>{
      if(!model) return console.warn("\n### ERR[1]: model database is empty");
      const out:ModelExt={...model,type:'tool',model,cover:null}
      models.push(out);
    })
    //cover
    this.covers.forEach(cover=>{
      if(!cover) return console.warn("\n### ERR[2]: Cover database is empty");
      const out:ModelExt={...cover,type:'cover',model:null,cover}
      models.push(out);
    });
    models=this.key.length?searchObj(this.key,models):models;
    this.views=separateObj(models,"group",{dataName:"models"});

    console.log("data after build",{models,all:this});
  }

  newModel(){
    const model=createModelData({userId:this.auth.currentUser.id})
    this.detailModel(model);
  }

  /** detail model */
  detail(model:ModelExt=null){
    if(model.type=='tool') return this.detailModel(model.model)
    if(model.type=='cover') return this.detailCover(model.cover);
  }

  detailCover(cover:CoverData){
    
  }
  
  /** show detail of model */
  detailModel(model:ModelData=null){
    const props:ModelPageOpts={model}
    this.disp.showModal(ModelPage,props)
    .then(result=>{
      const data=result.data as ModelPageOuts
      const role=result.role.toUpperCase();
      if(role=='OK'||role=='SAVE'){
        if(data.delImages.length) data.delImages.map(image=>this.storage.delete(image))
        this.storage.uploadImages(data.addImages,_STORAGE_MODELS)
        .then(urls=>{
          data.model.images=data.model.images.concat(urls.map(x=>typeof x=='string'?x:x.url));
          return data.model;
        })
        .then(xmodel=>this.db.add(_DB_MODELS,xmodel))
        .then(()=>console.log("save model '%s' was successfully!",data.model.id))
        .catch(err=>console.log("save model '%s' failured!/n",data.model.id,err))
        
      }
    })

  }

}


function btnDefault():ButtonData[]{
  return [
    {role:'new tool',icon:'hammer',handler:()=>{console.log("test result",this)}},
    {role:'new cover',icon:'cube'}//<ion-icon name="cube"></ion-icon>
  ]
}
