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

interface viewData {
  group:string;
  models:BasicData
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
  private _isData={cover:false,model:false};    //control update data
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
      this._isData.model=true;
      this.update();
    })

    //cover
    this._coverDb=this.db.connect(_DB_COVERS);
    this._coverDb.onUpdate((covers:CoverData[])=>{
      this.covers=covers;
      this._isData.cover=true;
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
    if(!Object.keys(this._isData).every(key=>this._isData[key]+""))
      return console.log("data is not available");
    //available data
    let models:BasicData[]=[];
    //model
    this.models.forEach(model=>{
      if(!model) return console.warn("\n### ERR[1]: model database is empty");
      const out:BasicData={
        id:model.id,
        name:model.name,
        group:model.group,
        images:model.images,
        type:'tool',
      }
      models.push(out);
    })
    //cover
    this.covers.forEach(cover=>{
      if(!cover) return console.warn("\n### ERR[2]: Cover database is empty");
      const out:BasicData={
        id:cover.id,
        name:cover.name,
        group:cover.group,
        images:cover.images,
        type:'cover',
      }
      models.push(out);
    });
    console.warn("models:",models);
    models=this.key.length?searchObj(this.key,models):models;
    this.views=separateObj(models,"group",{dataName:"models"});

    console.log("data after build",this);
    console.groupEnd();
  }

  /** detail model */
  detail(model:BasicData=null){
    const props:ModelPageOpts=model?{model:model.id}:{model:createModelData({userId:this.auth.currentUser.id})}
    this.disp.showModal(ModelPage,props)
    .then(result=>{
      const data=result.data as ModelPageOuts;
      const model=data.model;
      switch(result.role.toUpperCase()){
        case 'OK':
        case 'SAVE':{
          if(data.delImages) data.delImages.map(image=>this.storage.delete(image).catch(err=>console.warn("\n### ERR[1]: delete image is error",err)))
          this.storage.uploadImages(data.addImages,_STORAGE_MODELS)
          .then(urls=>{
            model.images=urls.map(image=>typeof image=='string'?image:image.url);
            return this.db.add(_DB_MODELS,model)
          })
          .then(()=>console.log("save model '%s' was successfully!",model.id))
          .catch(err=>console.log("save model '%s' is failured!",model.id,err))
        }
        break;

        case 'DELETE':{
          //delete image
          if(model.images.length) {
            const a=model.images.map(image=>this.storage.delete(image));
            Promise.all(a).then(()=>console.log("delete images [%s] to model '%s' is successfully",model.images.join(","),model.id))
            .catch(err=>console.log("delete images [%s] to model '%s' is failured!\n",model.images.join(","),model.id,err))
          }
          this.db.delete(_DB_MODELS,model.id)
          .then(()=>console.log("delete model '%s' was successfully!",model.id))
          .catch(err=>console.log("delete model '%s' was failured!",model.id))
        }
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
